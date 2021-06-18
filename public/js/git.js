window.addEventListener('DOMContentLoaded', (event) => {
    let data;

    let displayMessage = document.getElementById('displayMessage');
    let pushCommand    = document.getElementById('pushCommand');
    let pullCommand    = document.getElementById('pullCommand');
    let commitCommand  = document.getElementById('commitCommand');
    let diffCommand    = document.getElementById('diffCommand');

    let sendCommitBtn = document.getElementById('sendCommitBtn');
    let commitMsg     = document.getElementById("commitMsg");
    
    var modalCommit = new bootstrap.Modal(document.getElementById('exampleModal'))
    var modalResult = new bootstrap.Modal(document.getElementById('modalResult'))

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
            sendCommitBtn.setAttribute('disabled', true);
            let defineFolder = document.getElementById('defaultFolder').value;
            data = { message: commitMsg.value, folder: defineFolder }
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
                sendCommitBtn.removeAttribute('disabled')
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
        let defineFolder = document.getElementById('defaultFolder').value;
        fetch('/push', {
            method: "POST",
            body: JSON.stringify({folder: defineFolder}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ message }) => {
            displayMessage.textContent = message;
            modalResult.show();
        })
        .catch(err => console.log(err));
    })

    let fileName2     = document.getElementById('fileName');
    let selectCommit  = document.getElementById('selectCommit');
    let fileViewer2   = document.getElementById('fileViewer');
    let diffContainer = document.getElementById('diffContainer');
    let commitFile    = document.getElementById('commitFile');


    /**
     * Get diff command
     */
    diffCommand.addEventListener('click', evt => {
        evt.stopImmediatePropagation();

        fileName2.classList.remove("d-none");
        selectCommit.classList.toggle('d-none');
        fileViewer2.classList.toggle('d-none');
        diffContainer.classList.toggle('d-none');

        let defineFolder = document.getElementById('defaultFolder').value;
        fetch('/commit/list', {
            method: "POST",
            body: JSON.stringify({folder: defineFolder}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ content }) => {
            let renduSelect = "<option value='start'>Sélectionner le commit</option>";
            content.forEach(element => {
                renduSelect += `<option value="${element}">${element}</option>`
            });
            selectCommit.innerHTML = renduSelect;
        })
        .catch(err => console.log(err));
    })



    /**
     * Retrive diff depending commit
     */
    selectCommit.addEventListener("change", evt => {
        let dataCommit   = evt.currentTarget.value;
        let currentFile  = document.getElementById('currentFile').value;
        let defineFolder = document.getElementById('defaultFolder').value;

        if(dataCommit != "start" && currentFile != "") {
            fetch('/commit/diff', {
                method: "POST",
                body: JSON.stringify({folder: defineFolder, filePath: currentFile, commit: dataCommit}),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            })
            .then(response => response.json()) 
            .then(({ content }) => {
                commitFile.value = content;
            })
            .catch(err => console.log(err));
        } else {
            document.getElementById('commitFile').value = "--";
        }
    });


    /**
     * handle change to interactif gif diff
     */
    document.getElementById('localFile').addEventListener('change', evt => {
        let currentFile  = document.getElementById('currentFile').value;
        data = { filePath: currentFile, fileContent: evt.currentTarget.value }
        fetch("/save", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(() => {

        })
        .catch(err => console.log(err));

        let dataCommit   = selectCommit.value;
        let defineFolder = document.getElementById('defaultFolder').value;

        if(dataCommit != "start" && currentFile != "") {
            fetch('/commit/diff', {
                method: "POST",
                body: JSON.stringify({folder: defineFolder, filePath: currentFile, commit: dataCommit}),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            })
            .then(response => response.json()) 
            .then(({ content }) => {
                document.getElementById('commitFile').value = "--";
                commitFile.value = content;
            })
            .catch(err => console.log(err));
        } else {
            document.getElementById('commitFile').value = "--";
        }

        fetch('/commit/list', {
            method: "POST",
            body: JSON.stringify({folder: defineFolder}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ content }) => {
            let renduSelect = "<option value='start'>Sélectionner le commit</option>";
            content.forEach(element => {
                renduSelect += `<option value="${element}">${element}</option>`
            });
            selectCommit.innerHTML = renduSelect;
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
});