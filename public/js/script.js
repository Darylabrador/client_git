const remote = require('electron').remote;
const { dialog } = remote;
const path = require('path');
const fs = require('fs');
const dirTree = require("directory-tree");

window.addEventListener('DOMContentLoaded', (event) => {
    let req = new XMLHttpRequest();
    let method, data;

    let fileName = document.getElementById('fileName');
    let defaultFileName = "Aucun fichier sélectionner";
    let editor = document.getElementById('editor');

    let loading = document.getElementById('loading');
    let directoryNameDisplay = document.getElementById("directoryNameDisplay");
    let invalideFolder = document.getElementById("invalideFolder");
    let openFolder = document.getElementById("openFolder");
    let folderContent = document.getElementById('folderContent');

    const setDirectoryName = (directoryName) => {
        directoryNameDisplay.textContent = directoryName;
    }

    const openAction = (renderHtml, btnInfoPath, btnShowContent) => {
        btnShowContent.forEach(btn => {
            btn.addEventListener('click', evt => {
                let pathFile = btn.getAttribute('data-path');
                evt.stopImmediatePropagation();
                data = { filePath: pathFile }
                method = "POST";
                req.open(method, "/show/content");
                req.responseType = "json";
                req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                req.send(JSON.stringify(data));

                req.onload = () => {
                    if(req.readyState === XMLHttpRequest.DONE) {
                        if(req.status === 200) {
                            let reponse = req.response;
                            fileName.textContent = btn.getAttribute('data-name');
                            fileName.classList.remove('d-none');
                            editor.classList.remove("d-none");
                            editor.value = reponse.content;

                            editor.addEventListener('change', evt => {
                                data = { filePath: pathFile, fileContent: evt.currentTarget.value }
                                method = "POST";
                                req.open(method, "/save");
                                req.responseType = "json";
                                req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                                req.send(JSON.stringify(data));
                                req.onload = () => {
                                    if(req.readyState === XMLHttpRequest.DONE) {
                                        if(req.status === 200) {}
                                    }
                                }
                            });
                        }
                    } else {
                        console.log("une erreur est survenue")
                    }
                }
            })
        })

        btnInfoPath.forEach(btn => {
            btn.addEventListener('click', evt => {
                evt.stopImmediatePropagation();

                btn.classList.add('active');
                let contentTree = dirTree(btn.getAttribute('data-path'));
                renderHtml = "";
                if (contentTree.length != 0) {
                    if(contentTree.children) {
                        contentTree.children.forEach(element => {
                            if (element.type == "directory") {
                                renderHtml += `
                                        <button class="btn text-white d-flex align-items-center fw-bold btnInfoPath mx-1" data-path="${element.path}">
                                            <span class="mx-1"> - </span>
                                            <span class="iconify" data-inline="false" data-icon="ant-design:folder-open-filled" style="color: #fff; font-size: 19px; margin-right: 5px;"></span>
                                            <span> ${element.name} </span>
                                        </button>
                                        <div class="subContent"></div>`;
                            } else if (element.type == "file") {
                                renderHtml += `
                                        <button class="btn text-white d-flex align-items-center btnShowContent mx-1" data-path="${element.path}" data-name="${element.name}">
                                            <span class="mx-1"> - </span>
                                            <span class="text-underline"> ${element.name} </span>
                                        </button>
                                        <div class="subContent"></div>`;
                            }
                        });

                        if(btn.nextElementSibling.hasChildNodes()){
                            btn.nextElementSibling.innerHTML = "";
                        } else {
                            btn.nextElementSibling.innerHTML = renderHtml;
                        }
        
                        let btnInfoPath = document.querySelectorAll('.btnInfoPath');
                        let btnShowContent = document.querySelectorAll('.btnShowContent');
                        openAction(renderHtml, btnInfoPath, btnShowContent);
                    }
                }
            })
        })
    }


    openFolder.addEventListener("click", async (evt) => {
        try {
            fileName.textContent = defaultFileName;
            fileName.classList.add('d-none');
            editor.classList.add("d-none");
            editor.value = "";

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
                                            <button class="btn text-white d-flex align-items-center btnShowContent" data-path="${element.path}" data-name="${element.name}">
                                                <span> ${element.name} </span>
                                            </button>
                                            <div class="subContent"></div>`;
                                        }
                                    });

                                    folderContent.innerHTML = renderHtml;
                                    let btnInfoPath = document.querySelectorAll('.btnInfoPath');
                                    let btnShowContent = document.querySelectorAll('.btnShowContent');
                                    openAction(renderHtml, btnInfoPath, btnShowContent);
                                }
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