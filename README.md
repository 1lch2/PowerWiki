# COMP5347_Assignment_2
## Introduction
This repository of is a group work of Group 4 for Assignment 2 of COMP5437 from the University of Sydney.

Coded by the following three members:
- Chenghao Li : The controllers and the majority of front-end JS.
- Zidong Li: The views of front-end design and the JS of charts and other interactions.
- Limou Zhou: The models including all database query methods.

Be noticed that the credit of this proejct belongs to all three team members.

## Install dependencies
```
npm install
```
There may be one package missing in the package.json, please add it yourself.

## Start DB
### Batch script
start_db_server.bat
### Command line
Mac:
```bash
brew services start mongodb-community@4.2
```

Windows:
```shell
mongod -dbpath <"your specified location">
```    
## Import revisions
### Batch script
import_revisions.bat
### Command line
Mac:
```bash
cd ./public/data/Dataset_22_March_2020/revisions
for filename in *            
do
mongoimport --jsonArray --db Assignment --collection revisions --file $filename
done
```

Windows:
```shell
cd ./public/data/Dataset_22_March_2020/revisions
@echo off
for %%f in (*.json) do (
    "mongoimport.exe" --jsonArray --db Assignment --collection revision --file %%~nf.json
)
```
