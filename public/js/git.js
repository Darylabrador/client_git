window.addEventListener('DOMContentLoaded', (event) => {
    let originPath     = "";
    let data;

    let displayMessage = document.getElementById('displayMessage');
    let pushCommand    = document.getElementById('pushCommand');
    let pullCommand    = document.getElementById('pullCommand');
    let commitCommand  = document.getElementById('commitCommand');

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
});