const remote = require('electron').remote;
const { dialog } = remote;
const path = require('path');
const fs = require('fs');
const dirTree = require("directory-tree");

window.addEventListener('DOMContentLoaded', (event) => {
    let req = new XMLHttpRequest();
    let method, data;

    let loading = document.getElementById('loading');
    let directoryNameDisplay = document.getElementById("directoryNameDisplay");
    let invalideFolder = document.getElementById("invalideFolder");
    let openFolder = document.getElementById("openFolder");
    let folderContent = document.getElementById('folderContent');
    let fileViewer = document.getElementById('fileViewer');

    const setDirectoryName = (directoryName) => {
        directoryNameDisplay.textContent = directoryName;
    }

    function test() {
        console.log('tu me fait chier')
    }

    openFolder.addEventListener("click", async (evt) => {
        try {
            folderContent.innerHTML = "";
            directoryNameDisplay.textContent = "Choisir le projet git";
            loading.classList.remove('d-none');
            invalideFolder.classList.add('d-none');
            let directory = await dialog.showOpenDialog({ properties: ['openDirectory'] });

            if (directory.canceled) {
                loading.classList.add('d-none');
                directoryNameDisplay.textContent = "Choisir le projet git";
                folderContent.innerHTML = "";
            } else {
                if (directory.filePaths && directory.filePaths.length != 0) {

                    fs.access(path.join(directory.filePaths[0], ".git"), async function (error) {
                        if (error) {
                            folderContent.innerHTML = "";
                            invalideFolder.classList.remove('d-none');
                            directoryNameDisplay.textContent = "Choisir le projet git";
                        } else {
                            loading.classList.add('d-none');
                            invalideFolder.classList.add('d-none');
                            const filteredTree = dirTree(directory.filePaths[0]);

                            if (filteredTree) {
                                setDirectoryName(filteredTree.name);
                                if (filteredTree.children) {
                                    let renderHtml = "";

                                    filteredTree.children.forEach(element => {
                                        if (element.type == "directory") {
                                            renderHtml += `
                                            <button class="btn text-white d-flex align-items-center fw-bold btnInfoPath" data-path="${element.path}">
                                                <span class="iconify" data-inline="false" data-icon="ant-design:folder-open-filled" style="color: #fff; font-size: 19px; margin-right: 5px;"></span>
                                                <span> ${element.name} </span>
                                            </button>
                                            <div class="subContent"></div>`;
                                        } else if (element.type == "file") {
                                            renderHtml += `
                                            <button class="btn text-white d-flex align-items-center btnInfoPath" data-path="${element.path}">
                                                <span> ${element.name} </span>
                                            </button>
                                            <div class="subContent"></div>`;
                                        }
                                    });

                                    folderContent.innerHTML = renderHtml;
                                    let btnInfoPath = document.querySelectorAll('.btnInfoPath');
                                    let subContent = document.querySelectorAll('.subContent');

                                    btnInfoPath.forEach(btn => {
                                        btn.addEventListener('click', evt => {
                                            subContent.forEach(item => {
                                                item.innerHTML = "";
                                            });

                                            if(btn.classList.contains('active')){
                                                btn.classList.remove('active');
                                                renderHtml = "";
                                                btn.nextElementSibling.innerHTML = renderHtml;
                                            } else {
                                                btn.classList.add('active');
                                                let contentTree = dirTree(btn.getAttribute('data-path'));
                                                renderHtml = "";
                                                contentTree.children.forEach(element => {
                                                    if (element.type == "directory") {
                                                        renderHtml += `
                                                            <button class="btn text-white d-flex align-items-center fw-bold btnInfoPath" data-path="${element.path}">
                                                                <span class="mx-2"> - </span>
                                                                <span class="iconify" data-inline="false" data-icon="ant-design:folder-open-filled" style="color: #fff; font-size: 19px; margin-right: 5px;"></span>
                                                                <span> ${element.name} </span>
                                                            </button>
                                                            <div class="subContent"></div>`;
                                                    } else if (element.type == "file") {
                                                        renderHtml += `
                                                            <button class="btn text-white d-flex align-items-center btnInfoPath" data-path="${element.path}">
                                                                <span class="mx-2"> - </span>
                                                                <span> ${element.name} </span>
                                                            </button>
                                                            <div class="subContent"></div>`;
                                                    }
                                                });
                                                btn.nextElementSibling.innerHTML = renderHtml;
                                            }
                                        })
                                    })
                                }

                                console.log(filteredTree)
                            }
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    })
});