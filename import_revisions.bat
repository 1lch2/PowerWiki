@echo off
cd ".\public\data\Dataset_22_March_2020\revisions"
for %%f in (*.json) do (
"mongoimport.exe" --jsonArray --db Assignment --collection revisions --file "%%~nf.json"
)
pause