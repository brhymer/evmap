import boto3
import os

s3_client = boto3.client('s3')
bucket_name = 'ev-map'

def upload_file_to_s3(file_path, bucket_name, s3_key):
    """Uploads a file to S3 at the specified key."""
    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        print(f"Uploaded {file_path} to s3://{bucket_name}/{s3_key}")
    except Exception as e:
        print(f"Failed to upload {file_path}: {e}")

def upload_folder_to_s3(local_folder_path, county_name):
    """Uploads files from a local folder to structured S3 paths based on file names and given county name."""
    for file_name in os.listdir(local_folder_path):
        if file_name.endswith('.json'):
            parts = file_name.rsplit('_', 1)
            if len(parts) == 2:
                city_and_county = parts[0]
                file_type = parts[1].replace('.json', '') 
                city_name = city_and_county.replace(county_name, '').strip('_')  
                s3_key = f"CA/{county_name}_county/{city_name}/{city_name}_{file_type}.json"
                s3_folder = f"CA/{county_name}_county/{city_name}/"
                response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder)
                if 'Contents' in response:
                    file_path = os.path.join(local_folder_path, file_name)
                    upload_file_to_s3(file_path, bucket_name, s3_key)
                else:
                    print(f"Path not found: {s3_folder}. Skipping {file_name}.")
            else:
                print(f"File name format not recognized or missing file type: {file_name}. Skipping.")
        else:
            print(f"Non-JSON file skipped: {file_name}")