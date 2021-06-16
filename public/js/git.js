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


    /**
     * Action to pull data from git repo
     */
    pullCommand.addEventListener('click', evt => {
        evt.stopPropagation();
        pullCommand.setAttribute('disabled', true);
        let defineFolder = document.getElementById('defaultFolder').value;
        fetch('/pull', {
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


    /**
     * Get diff command
     */
    diffCommand.addEventListener('click', evt => {
        evt.stopImmediatePropagation();
        let defineFolder = document.getElementById('defaultFolder').value;
        fetch('/commit/list', {
            method: "POST",
            body: JSON.stringify({folder: defineFolder}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(({ content }) => {
            console.log(content)
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