const { remote } = require('electron');

/**
 * Actions on the app window's
 */
window.addEventListener('DOMContentLoaded', (event) => {
    var actualWin = remote.getCurrentWindow();
    document.getElementById('minimize').addEventListener('click', evt => {
        actualWin.minimize();
    })

    document.getElementById('maximize').addEventListener('click', evt => {
        if (!actualWin.isMaximized()) {
            return actualWin.maximize();
        }
        actualWin.unmaximize();
    })

    document.getElementById('close').addEventListener('click', evt => {
        actualWin.close();
    })
})