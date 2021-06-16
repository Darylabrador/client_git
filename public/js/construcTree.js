const remote        = require('electron').remote;
const { dialog }    = remote;
const fs            = require("fs");
const path          = require('path');
const dirTree       = require("directory-tree");

window.addEventListener('DOMContentLoaded', (event) => {
    let defaultFileName      = "Aucun fichier sélectionner";
    let originPath           = "";
    let data;

    let historyOption        = document.getElementById('historyOption');
    let openRecentBtn        = document.getElementById('openRecentBtn');
    let openFolder           = document.getElementById("openFolder");
    let directoryNameDisplay = document.getElementById("directoryNameDisplay");
    
    let folderContent        = document.getElementById('folderContent');
    let editor               = document.getElementById('editor');
    let fileName             = document.getElementById('fileName');
    let gitCommand           = document.getElementById('gitCommand');
    let fileViewer           = document.getElementById('fileViewer');
    let initContainer        = document.getElementById('initContainer');

    var modalRecent          = new bootstrap.Modal(document.getElementById('openRecentModal'))

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
                fileViewer.classList.add('d-none');
                initContainer.classList.add('d-none');
            } else {
                fs.access(path.join(directory.filePaths[0], ".git"), async function (error) {
                    const filteredTree = dirTree(directory.filePaths[0]);
                    document.getElementById('defaultFolder').value = directory.filePaths[0];

                    if(error) {
                        folderContent.innerHTML = "";
                        fileViewer.classList.add('d-none');
                        gitCommand.classList.add('d-none');
                        initContainer.classList.remove('d-none');
                        setDirectoryName(filteredTree.name);
                    } else {
                        if (directory.filePaths && directory.filePaths.length != 0) {
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
        
                            if (filteredTree) {
                                fileViewer.classList.remove('d-none');
                                initContainer.classList.add('d-none');
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
                }) 
            }
        } else {
            document.getElementById('defaultFolder').value = directoryPath;
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
     * Handle open recent folders
     */
    openRecentBtn.addEventListener('click', evt => {
        evt.stopPropagation();
        openFolderContent(historyOption.value);
        modalRecent.hide();
    });
    

    
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
    });


    document.getElementById('openRecentModal').addEventListener('show.bs.modal', function (event) {
        gitCommand.classList.add('d-none');
        fileName.textContent = defaultFileName;
        fileName.classList.add('d-none');
        editor.classList.add("d-none");
        editor.value = "";

        folderContent.innerHTML = "";
        directoryNameDisplay.textContent = "Choisir le projet git";
    })

    var modalResult = new bootstrap.Modal(document.getElementById('modalResult'))
    var initModal = new bootstrap.Modal(document.getElementById('initModal'))

    /**
     * Disable commit button
     */
    commitCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        commitCommand.setAttribute('disabled', true);
    });


    getHistory();

    /**
     * Init a repos with .git
     */
    let initRepoBtn   = document.getElementById('initRepoBtn');

    initRepoBtn.addEventListener('click', evt => {
        evt.stopImmediatePropagation();
        let defineFolder = document.getElementById('defaultFolder').value;

        data = { folder: defineFolder, repoUrl: document.getElementById('initRepoUrl').value }

        fetch('/init', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ message }) => {
            displayMessage.textContent = message;
            modalResult.show();
            initModal.hide();
            initContainer.classList.add('d-none');
            fileViewer.classList.remove('d-none');
            openFolderContent(defineFolder)
        })
        .catch(err => console.log(err));
    })

    document.getElementById('initModal').addEventListener('hidden.bs.modal', function (event) {
        document.getElementById('initRepoUrl').value = "";
    })
})