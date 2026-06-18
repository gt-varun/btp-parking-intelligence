from pymongo import MongoClient
import pandas as pd

MONGO_URI = "mongodb+srv://varunyr1224_db_user:Varunyr1224@crud-db.2fsx7le.mongodb.net/?appName=CRUD-db"

print("Reading CSV...")
df = pd.read_csv("violations_raw.csv")

print(f"Loaded {len(df)} rows")

client = MongoClient(MONGO_URI)

db = client["btp_db"]

print("Clearing old data...")
db.violations_raw.delete_many({})

print("Uploading...")
records = df.to_dict("records")

batch_size = 5000

for i in range(0, len(records), batch_size):
    db.violations_raw.insert_many(records[i:i+batch_size])
    print(f"Uploaded {min(i+batch_size, len(records))}/{len(records)}")

print("Done!")