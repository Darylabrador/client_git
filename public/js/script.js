const remote        = require('electron').remote;
const { dialog }    = remote;
const path          = require('path');
const fs            = require('fs');
const dirTree       = require("directory-tree");

window.addEventListener('DOMContentLoaded', (event) => {
    let req         = new XMLHttpRequest();
    let originPath  = "";
    let method, data;

    let defaultFileName      = "Aucun fichier sélectionner";
    let displayMessage       = document.getElementById('displayMessage');
    let historyOption        = document.getElementById('historyOption');

    let gitCommand           = document.getElementById('gitCommand');
    let pushCommand          = document.getElementById('pushCommand');
    let pullCommand          = document.getElementById('pullCommand');
    let commitCommand        = document.getElementById('commitCommand');

    let openFolder           = document.getElementById("openFolder");
    let directoryNameDisplay = document.getElementById("directoryNameDisplay");
    let folderContent        = document.getElementById('folderContent');
    let editor               = document.getElementById('editor');
    let fileName             = document.getElementById('fileName');
    
    let openRecentBtn       = document.getElementById('openRecentBtn');


    /**
     * Set folder name
     * @param {String} directoryName 
     */
    const setDirectoryName = (directoryName) => {
        directoryNameDisplay.textContent = directoryName;
    }


    /**
     * Get path history
     */
    const getHistory = () => {
        method = "GET";
        req.open(method, "/history");
        req.responseType = "json";
        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        req.send(null);
        req.onload = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    let reponse = req.response;
                    let renderOption  = "";
                    if(reponse.history && reponse.history.length != 0) {
                        reponse.history.forEach(element => {
                            let folderpathArray = element.path.split('\\');
                            let folderName = folderpathArray[folderpathArray.length - 1]
                            renderOption += `<option value=${element.path}> ${folderName}</option>`;
                        })
                        historyOption.innerHTML = renderOption;
                    }
                }
            }
        }
    }

    
    /**
     * Handle open recent folders
     */
     openRecentBtn.addEventListener('click', evt => {
        evt.stopPropagation();
        openFolderContent(historyOption.value);
        modalRecent.hide();
    });


    /**
     * Recursive function to open folder tree (open all lvl folder)
     * 
     * @param {*} renderHtml 
     * @param {*} btnInfoPath 
     * @param {*} btnShowContent 
     */
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
                    if (req.readyState === XMLHttpRequest.DONE) {
                        if (req.status === 200) {
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
                            });
                        }
                    } else {
                        console.error("une erreur est survenue")
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
                    if (contentTree.children) {
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

                        if (btn.nextElementSibling.hasChildNodes()) {
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


    /**
     * Show folder tree (first lvl)
     * @param {String} directoryPath 
     */
    const openFolderContent = async (directoryPath = null) => {
        if(!directoryPath) {
            let directory = await dialog.showOpenDialog({ properties: ['openDirectory'] });

            if (directory.canceled) {
       
                directoryNameDisplay.textContent = "Choisir le projet git";
                folderContent.innerHTML = "";
                gitCommand.classList.add('d-none');
            } else {
                if (directory.filePaths && directory.filePaths.length != 0) {

                    fs.access(path.join(directory.filePaths[0], ".git"), async function (error) {
                        if (error) {
                            folderContent.innerHTML = "";

                            gitCommand.classList.add('d-none');
                            directoryNameDisplay.textContent = "Choisir le projet git";
                        } else {
                            originPath = directory.filePaths[0];

                            data = { folderPath: originPath }
                            method = "POST";
                            req.open(method, "/history/save");
                            req.responseType = "json";
                            req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                            req.send(JSON.stringify(data));
                            req.onload = () => {
                                if (req.readyState === XMLHttpRequest.DONE) {
                                    if (req.status === 200) {
                                        getHistory();
                                    }
                                }
                            }

                            const filteredTree = dirTree(directory.filePaths[0]);

                            if (filteredTree) {
                                setDirectoryName(filteredTree.name);
                                gitCommand.classList.remove('d-none');
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
        } else {
            originPath = directoryPath;
            data = { folderPath: originPath }
            method = "POST";
            req.open(method, "/history/save");
            req.responseType = "json";
            req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            req.send(JSON.stringify(data));
            req.onload = () => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        getHistory();
                    }
                }
            }

            const filteredTree = dirTree(directoryPath);

            if (filteredTree) {
                setDirectoryName(filteredTree.name);
                gitCommand.classList.remove('d-none');
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
    }


    /**
     * Handle click on "Open" to show folder tree
     */
    openFolder.addEventListener("click", async (evt) => {
        try {
            gitCommand.classList.add('d-none');
            fileName.textContent = defaultFileName;
            fileName.classList.add('d-none');
            editor.classList.add("d-none");
            editor.value = "";

            folderContent.innerHTML = "";
            directoryNameDisplay.textContent = "Choisir le projet git";
    
            openFolderContent();
        } catch (error) {
            console.error('Une erreur est survenue');
        }
    })

    let sendCommitBtn = document.getElementById('sendCommitBtn');
    let commitMsg = document.getElementById("commitMsg");

    var modalCommit = new bootstrap.Modal(document.getElementById('exampleModal'))
    var modalResult = new bootstrap.Modal(document.getElementById('modalResult'))
    var modalRecent = new bootstrap.Modal(document.getElementById('openRecentModal'))


    /**
     * Disable commit button
     */
    commitCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        commitCommand.setAttribute('disabled', true);
    });


    /**
     * Action to send the commit with it's message
     */
    sendCommitBtn.addEventListener('click', evt => {
        evt.stopPropagation();
        if (commitMsg.value != "") {

            data = { message: commitMsg.value, folder: originPath }
            method = "POST";
            req.open(method, "/commit");
            req.responseType = "json";
            req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            req.send(JSON.stringify(data));
            req.onload = () => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        let reponse = req.response;
                        if(reponse.message) {
                            displayMessage.textContent = reponse.message;
                            modalResult.show();
                            modalCommit.hide();
                        }
                    }
                }
            }
        }
    })


    /**
     * Action to push all commit to git repo
     */
    pushCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        pushCommand.setAttribute('disabled', true);

        method = "POST";
        req.open(method, "/push");
        req.responseType = "json";
        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        req.send(JSON.stringify({folder: originPath}));
        req.onload = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    let reponse = req.response;
                    if(reponse.message) {
                        displayMessage.textContent = reponse.message;
                        modalResult.show();
                    }
                }
            }
        }
    })


    /**
     * Action to pull data from git repo
     */
    pullCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        pullCommand.setAttribute('disabled', true);

        method = "POST";
        req.open(method, "/pull");
        req.responseType = "json";
        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        req.send(JSON.stringify({folder: originPath}));
        req.onload = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    let reponse = req.response;
                    if(reponse.message) {
                        displayMessage.textContent = reponse.message;
                        modalResult.show();
                    }
                }
            }
        }
    })

    document.getElementById('exampleModal').addEventListener('hidden.bs.modal', function (event) {
        commitMsg.value = "";
        commitCommand.removeAttribute("disabled")
    })

    document.getElementById('modalResult').addEventListener('hidden.bs.modal', function (event) {
        displayMessage.textContent = "";
        pushCommand.removeAttribute("disabled");
        pullCommand.removeAttribute("disabled");
    })

    document.getElementById('openRecentModal').addEventListener('show.bs.modal', function (event) {
        gitCommand.classList.add('d-none');
        fileName.textContent = defaultFileName;
        fileName.classList.add('d-none');
        editor.classList.add("d-none");
        editor.value = "";

        folderContent.innerHTML = "";
        directoryNameDisplay.textContent = "Choisir le projet git";
    })

    getHistory();
});