const remote        = require('electron').remote;
const { dialog }    = remote;
const path          = require('path');
const fs            = require('fs');
const dirTree       = require("directory-tree");

window.addEventListener('DOMContentLoaded', (event) => {
    let originPath  = "";
    let data;

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
        fetch("/history", {
            method: "GET",
            headers: {"Content-type": "application/json;charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({history}) => {
            let renderOption  = "";
            if(history && history.length != 0) {
                history.forEach(element => {
                    let folderpathArray = element.path.split('\\');
                    let folderName = folderpathArray[folderpathArray.length - 1]
                    renderOption += `<option value=${element.path}> ${folderName}</option>`;
                })
                historyOption.innerHTML = renderOption;
            }
        })
        .catch(err => console.log(err));
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

                fetch("/show/content", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {"Content-type": "application/json; charset=UTF-8"}
                })
                .then(response => response.json()) 
                .then(({ content }) => {
                    editor.value = content;
                    fileName.textContent = btn.getAttribute('data-name');
                    fileName.classList.remove('d-none');
                    editor.classList.remove("d-none");

                    editor.addEventListener('change', evt => {
                        data = { filePath: pathFile, fileContent: evt.currentTarget.value }
                        fetch("/save", {
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: {"Content-type": "application/json; charset=UTF-8"}
                        })
                        .then(response => response.json()) 
                        .then(({ content }) => {
                            editor.value = content;
                            fileName.textContent = btn.getAttribute('data-name');
                            fileName.classList.remove('d-none');
                            editor.classList.remove("d-none");
                        })
                        .catch(err => console.log(err));
                    })
                })
                .catch(err => console.log(err));
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

                            fetch('/history/save', {
                                method: "POST",
                                body: JSON.stringify(data),
                                headers: {"Content-type": "application/json; charset=UTF-8"}
                            })
                            .then(response => response.json()) 
                            .then(json => getHistory())
                            .catch(err => console.log(err));

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
            fetch('/history/save', {
                method: "POST",
                body: JSON.stringify(data),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            })
            .then(response => response.json()) 
            .then(json => getHistory())
            .catch(err => console.log(err));

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
            fetch('/commit', {
                method: "POST",
                body: JSON.stringify(data),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            })
            .then(response => response.json()) 
            .then(({ message }) => {
                displayMessage.textContent = message;
                modalResult.show();
                modalCommit.hide();
            })
            .catch(err => console.log(err));
        }
    })


    /**
     * Action to push all commit to git repo
     */
    pushCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        pushCommand.setAttribute('disabled', true);
        fetch('/push', {
            method: "POST",
            body: JSON.stringify({folder: originPath}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ message }) => {
            displayMessage.textContent = message;
            modalResult.show();
        })
        .catch(err => console.log(err));
    })


    /**
     * Action to pull data from git repo
     */
    pullCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        pullCommand.setAttribute('disabled', true);
        fetch('/pull', {
            method: "POST",
            body: JSON.stringify({folder: originPath}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ message }) => {
            displayMessage.textContent = message;
            modalResult.show();
        })
        .catch(err => console.log(err));
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