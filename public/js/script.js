import FileTree from '../../utils/FileTree.js';
const remote = require('electron').remote;
const { dialog } = remote;

window.addEventListener('DOMContentLoaded', (event) => {
    let req = new XMLHttpRequest();
    let method, data;

    let openFolder = document.getElementById("openFolder");

    openFolder.addEventListener("click",  async (evt) => {
        try {
            var directory = await dialog.showOpenDialog({ properties: ['openDirectory'] });
            var fileTree = new FileTree(directory.filePaths[0]);
            fileTree.build();
            console.log(fileTree);
            
        } catch (error) {
            console.log(error)
        }
 
    })
});