import boto3
import os
from googleapiclient.discovery import build
import shutil


from google.oauth2 import service_account

# Path to service account key file
SERVICE_ACCOUNT_FILE = 'path/to/credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

boundaries = '_city_boundary.geojson'


def list_files_in_folder(service, folder_id):
    files = []
    page_token = None
    while True:
        response = service.files().list(
            q=f"'{folder_id}' in parents",
            spaces='drive',
            fields="nextPageToken, files(id, name)",
            pageToken=page_token
        ).execute()
        files.extend(response.get('files', []))
        page_token = response.get('nextPageToken', None)
        if not page_token:
            break
    return files

def download_file(service, file_id, file_name, destination_folder):
    request = service.files().get_media(fileId=file_id)
    with open(os.path.join(destination_folder, file_name), 'wb') as f:
        downloader = googleapiclient.http.MediaIoBaseDownload(f, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Download {file_name} {int(status.progress() * 100)}%")


s3_client = boto3.client('s3')
bucket_name = 'ev-map'

def load_city_to_county_map(json_file_path):
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    city_to_county_map = {}
    for county in data:
        county_name = county['name'].strip().lower().replace(" ", "_")
        for city in county['cities']:
            city_name = city['name'].strip().lower().replace(" ", "_")
            city_to_county_map[city_name] = county_name
    return city_to_county_map

city_to_county_map = load_city_to_county_map('public/jurisdictions.json')
def get_county_name_for_city(city_name):
    if city_name.startswith('un_'):
        city_name = city_name[3:] 
    return city_to_county_map.get(city_name, 'UnknownCounty')

def upload_file_to_s3(file_path, bucket_name, s3_key):
    s3_client.upload_file(file_path, bucket_name, s3_key)
    print(f"Uploaded {file_path} to s3://{bucket_name}/{s3_key}")

def clean_city_name(file_name, file_suffix):
    cleaned_name = file_name.replace(file_suffix, '')
    return cleaned_name

def folder_exists_in_s3(bucket_name, s3_key):
    s3 = boto3.client('s3')
    try:
        s3.head_object(Bucket=bucket_name, Key=s3_key)
        return True
    except:
        return False

def transfer_files(layer):
    google_drive_folder_id = '1FetIQPUpA7zAvP7HwH1jcaThTnHA7apI'
    temp_download_folder = 'temp_downloads'
    if not os.path.exists(temp_download_folder):
        os.makedirs(temp_download_folder)
    city_files = list_files_in_folder(drive_service, google_drive_folder_id)
    for file in city_files:
        original_file_name = file['name']
        if original_file_name.startswith('un_'):
            city_name = clean_city_name(original_file_name, '_boundary.geojson')
            city_name += '_county'
        else:
            city_name = clean_city_name(original_file_name, '_city_boundary.geojson')
        county_name = get_county_name_for_city(city_name)
        if county_name == 'UnknownCounty':
            print(f"Warning: No county found for city '{city_name}'. Skipping.")
            continue
        s3_key = f"CA/{county_name}/{city_name}/"
        if not subfolder_exists_in_s3(bucket_name, s3_key):
            print(f"Warning: No suitable folder found for file '{original_file_name}'. Skipping. {s3_key}")
            continue
        download_file(drive_service, file['id'], original_file_name, temp_download_folder)
        upload_file_to_s3(os.path.join(temp_download_folder, original_file_name), bucket_name, os.path.join(s3_key, original_file_name))
    shutil.rmtree(temp_download_folder)

def transfer_files_simple():
    google_drive_folder_id = '10ZpldZtNNhXIXNfCMPRRcQ1z_85iCE32'
    temp_download_folder = 'temp_downloads'
    if not os.path.exists(temp_download_folder):
        os.makedirs(temp_download_folder)
    all_files = list_files_in_folder(drive_service, google_drive_folder_id)
    for file in all_files:
        s3_key = f"CA/Co-location_points/CA_parks/"
        filename = file['name'].replace("park.geojson", "parks.geojson")
        download_file(drive_service, file['id'], filename, temp_download_folder)
        upload_file_to_s3(os.path.join(temp_download_folder, filename), bucket_name, os.path.join(s3_key, filename))
    shutil.rmtree(temp_download_folder)

transfer_files(boundaries)

def subfolder_exists_in_s3(bucket_name, subfolder_key):
    result = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=subfolder_key, Delimiter='/')
    for content in result.get('CommonPrefixes', []):
        if content.get('Prefix') == subfolder_key+'/':
            return True
    return False


# For deleting "/" files in S3 -- Don't use
def list_objects_with_prefix(bucket_name, prefix):
    objects = []
    paginator = s3_client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        if 'Contents' in page:
            objects.extend(page['Contents'])
    return objects

objects_to_delete = list_objects_with_prefix("ev-map", "CA/")

# Filter objects that are named "/"
slash_objects = [obj['Key'] for obj in objects_to_delete if obj['Key'].endswith('/')]

# don't use
def delete_objects(bucket_name, keys):
    if not keys:
        print("No objects to delete.")
        return
    delete_keys = [{'Key': key} for key in keys]
    s3_client.delete_objects(
        Bucket=bucket_name,
        Delete={
            'Objects': delete_keys,
            'Quiet': True
        }
    )
    print(f"Deleted {len(keys)} objects.")

delete_objects(bucket_name, slash_objects)


def upload_file_to_city(local_file_path, city_folder, city_name, filetype):
    s3_key = f"{city_folder}{city_name}_{filetype}.geojson"
    print(f"Uploading to S3 key: {s3_key}")
    s3_client.upload_file(local_file_path, bucket_name, s3_key)


def mass_upload_to_s3(local_file_path, filetype):
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix="CA/", Delimiter='/')
    if 'CommonPrefixes' in response:
        for county in response['CommonPrefixes']:
            county_folder = county['Prefix']
            print(f"County folder: {county_folder}")
            # List cities within each county
            city_response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=county_folder, Delimiter='/')
            if 'CommonPrefixes' in city_response:
                for city in city_response['CommonPrefixes']:
                    city_folder = city['Prefix']
                    city_name = city_folder.split('/')[-2]  # Extract city name from the folder path
                    # Upload the healthcare file to the city folder
                    print(f"Uploading to city folder: {city_folder} with file name {city_name}_{filetype}.geojson")
                    upload_file_to_city(local_file_path, city_folder, city_name, filetype)

