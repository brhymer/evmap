import boto3
import json

def rebuild_S3_buckets():
    s3_client = boto3.client('s3')
    bucket_name = 'ev-map'
    root_folder = 'CA/'
    def create_s3_folder(bucket, folder_name):
        s3_client.put_object(Bucket=bucket, Key=(folder_name + '/'))
    def format_name(name):
        return name.strip().lower().replace(' ', '_')
    # Draw county and city data from 'jurisdictions' file
    with open('public/jurisdictions.json', 'r') as file:
        jurisdictions = json.load(file)
    # Create the folders
    for county in jurisdictions:
        county_name = format_name(county['name'])
        county_folder = f'{root_folder}{county_name}/'
        create_s3_folder(bucket_name, county_folder)
        print(f'Created folder for county: {county_folder}')
        for city in county['cities']:
            city_name = format_name(city['name'])
            city_folder = f'{county_folder}{city_name}/'
            create_s3_folder(bucket_name, city_folder)
            print(f'  Created folder for city: {city_folder}')