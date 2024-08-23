/**
*  Author: Dev_Nergis
*  Contact: admin@nergis.dev
*/

/**
 * Copies the given URL to the clipboard.
 * 
 * @param {string} url - The URL to be copied.
 * @returns {void}
 */
function copyToClipboard(url) {
    const urlText = url;
    navigator.clipboard.writeText(urlText).then(() => {
        alert('URL copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

function updateSize() {
    let nBytes = 0,
        oFiles = document.getElementById("file").files,
        nFiles = oFiles.length;
    for (let nFileId = 0; nFileId < nFiles; nFileId++) {
        nBytes += oFiles[nFileId].size;
    }
    let sOutput = nBytes + " bytes";
    for (
        let aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
        nMultiple = 0,
        nApprox = nBytes / 1024;
        nApprox > 1;
        nApprox /= 1024, nMultiple++
    ) {
        sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }
    document.getElementById("fileNum").innerHTML = nFiles;
    document.getElementById("fileSize").innerHTML = sOutput;
}

/**
 * Handles the success of the upload process.
 * 
 * @param {Object} response - The response object containing the uploaded file information.
 * @returns {void}
 */
function handleUploadSuccess(response) {
    $('#status').text("Done!");
    $('#progressBar').css('width', '100%');
    $('#progressBar').text('100%');
    let text = "";
    for (let i = 0; i < response.file_direct.length; i++) {
        const url = response.file_direct[i];
        shortenUrl(url, function(shortLink) {
            text += '<a rel="noopener" href="' + shortLink + '" target="_blank">' + shortLink + "</a><br />";
            $('#url').html(text);
        });
    }
}

/**
 * Uploads files to the server.
 */
function uploadFiles() {
    const fileList = $('#file')[0].files;
    const password = $('#password').val();
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i], fileList[i].name);
    }
    $('#status').text("Uploading...");
    $.ajax({
        url: "https://api.nergis.dev/v1/file/upload",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        headers: password ? { "x-password": password } : {},
        xhr: function() {
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    console.log(`Progress: ${percentComplete}% (Loaded: ${e.loaded}, Total: ${e.total})`);
                    $('#progressBar').css('width', percentComplete + '%');
                    $('#progressBar').text(percentComplete.toFixed(2) + '%');
                }
            }, false);
            return xhr;
        },
        success: handleUploadSuccess
    });
}

/**
 * Calculates the total size of selected files and updates the file count and size display.
 */
function updateSize() {
    let nBytes = 0,
        oFiles = document.getElementById("file").files,
        nFiles = oFiles.length;
    for (let nFileId = 0; nFileId < nFiles; nFileId++) {
        nBytes += oFiles[nFileId].size;
    }
    let sOutput = nBytes + " bytes";
    for (
        let aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
        nMultiple = 0,
        nApprox = nBytes / 1024;
        nApprox > 1;
        nApprox /= 1024, nMultiple++
    ) {
        sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }
    document.getElementById("fileNum").innerHTML = nFiles;
    document.getElementById("fileSize").innerHTML = sOutput;
}

$(document).ready(function() {
    $('form').on('submit', function(e) {
        e.preventDefault();
        $('#progressBar').css('width', '0%');
        const fileList = $('#file')[0].files;
        const password = $('#password').val();
        const formData = new FormData();
        for (let i = 0; i < fileList.length; i++) {
            formData.append("files", fileList[i], fileList[i].name);
        }
        $('#status').text("Uploading...");
        $.ajax({
            url: "https://api.nergis.dev/v1/file/upload",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: password ? { "x-password": password } : {},
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(e) {
                    if (e.lengthComputable) {
                        /**
                         * Calculates the percentage of completion.
                         *
                         * @param {number} percentComplete - The percentage of completion.
                         * @returns {number} - The calculated percentage.
                         */
                        const percentComplete = (e.loaded / e.total) * 100;
                        console.log(`Progress: ${percentComplete}% (Loaded: ${e.loaded}, Total: ${e.total})`);
                        $('#progressBar').css('width', percentComplete + '%');
                        $('#progressBar').text(percentComplete.toFixed(2) + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                $('#status').text("Done!");
                $('#progressBar').css('width', '100%');
                $('#progressBar').text('100%');
                let text = "";
                for (let i = 0; i < response.file_direct.length; i++) {
                    const url = response.file_direct[i];
                    $.ajax({
                        url: "https://sqlr.kr/shorten",
                        type: "POST",
                        data: JSON.stringify({ "url": url }),
                        contentType: "application/json",
                        success: function(response) {
                            const shortLink = response.short_link;
                            const urlContainer = document.createElement('div');
                            urlContainer.innerHTML = `
                                <a rel="noopener" href="${shortLink}" target="_blank">${shortLink}</a>
                                <button onclick="copyToClipboard('${shortLink}')">
                                    <i class="fa fa-copy"></i>
                                </button>
                                <br />
                            `;
                            document.getElementById('url').appendChild(urlContainer);
                        }
                    });
                };
            }
        });
    });
});
