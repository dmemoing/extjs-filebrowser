## extjs-filemanager API docs


> *The root directory must name ``localfolder``*


#### urlGet (URL: address.urlGet, Method: GET)

**JSON Request content**
```json
{
    "cmd": "get",
    "path": "localfolder/new"
}
```
**JSON Response**
```json
[ 
    {
        "text": "magento",
        "path": "localfolder/new/magento",
        "leaf": "false"
    }, {
        "text": "index.php",
        "path": "localfolder/new/index.php",
        "leaf": "true"
    }
]
```
--------------------
#### urlNewFile (URL: address.urlNewFile, Method: POST)
**JSON Request content**
```json
{
    "cmd": "new",
    "content": "",
    "path": "localfolder/new"
}
```
**JSON Response**
```json
{ "log": "new created successfully!" }
```
--------------------
#### urlNewDirectory (URL: address.urlNewDirectory, Method: POST)
**JSON Request content**
```json
{
    "path": "localfolder/newfolder"
}
```
**JSON Response**
```json
{ "log": "new directory created successfully!" }
```
--------------------
#### urlRename (URL: address.urlRename, Method: PUT)
**JSON Request content**
```json
{
    "path": "localfolder/index.php",
    "newname": "localfolder/index-newname.php"
}
```
**JSON Response**
```json
{ "log": "rename successfully!" }
```
--------------------
#### urlDelete (URL: address.urlDelete, Method: DELETE)
**JSON Request content**
```json
{
    "path": "localfolder/"
}
```
**JSON Response**
```json
{ "log": "delete successfully!" }
```
--------------------
#### urlCpmv (URL: address.urlCpmv, Method: POST)
**JSON Request content**
```json
copy:
{
    "cmd": "copy",
    "src": "localfolder/newfile.c",
    "dst": "localfolder"
}

move:
{
    "cmd": "move",
    "src": "localfolder/newfile.c",
    "dst": "localfoler"
}
```
**JSON Response**
```json
{ "log": "cpmv successfully!" }
```
--------------------
#### urlViewFile (URL: address.urlViewFile, Method: GET)
**JSON Request content**
```json
{
    "cmd": "view",
    "path": "localfolder/index.html"
}
```
**Response**
Respond the content of the file. Get by response.responseText.

--------------------
#### urlSave (URL: address.urlSave, Method: POST)
**JSON Request content**
```json
{
    "cmd": "update",
    "content": "the content of the whole file",
    "path": "localfolder/index.php"
}
```
**JSON Response**
```json
{ "log": "file updated successfully!" }
```