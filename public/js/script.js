import FileTree from '../../utils/FileTree.js';
const remote = require('electron').remote;
const { dialog } = remote;
const path = require('path');

window.addEventListener('DOMContentLoaded', (event) => {
    let req = new XMLHttpRequest();
    let method, data;

    let loading = document.getElementById('loading');
    let directoryNameDisplay = document.getElementById("directoryNameDisplay");
    let openFolder = document.getElementById("openFolder");

    const setDirectoryName = (directoryName) => {
        directoryNameDisplay.textContent = directoryName;
    }

    openFolder.addEventListener("click",  async (evt) => {
        try {
            loading.classList.remove('d-none');
            let directory = await dialog.showOpenDialog({ properties: ['openDirectory'] });

            if(directory.canceled){
                loading.classList.add('d-none');
            } else {

                if(directory.filePaths && directory.filePaths.length != 0){
                    let directoryArray = directory.filePaths[0].split("\\");
                    let directoryName  = directoryArray[directoryArray.length - 1];
                    await setDirectoryName(directoryName);
    
                    var fileTree = new FileTree(directory.filePaths[0]);
                    fileTree.build();
                    console.log(fileTree);
                    loading.classList.add('d-none');
                }
            }
        } catch (error) {
            console.log(error)
        }
 
    })
});