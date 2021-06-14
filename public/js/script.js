window.addEventListener('DOMContentLoaded', (event) => {
    let reinitOpenFormBtn = document.getElementById('reinit1');
    let reinitStructureFormBtn = document.getElementById('reinit2');

    let formOpenProject = document.getElementById('formOpenProject');
    let formShowStructure = document.getElementById('formShowStructure');

    reinitOpenFormBtn.addEventListener('click', evt => {
        formOpenProject.reset();
    })

    reinitStructureFormBtn.addEventListener('click', evt => {
        formShowStructure.reset();
    })
});