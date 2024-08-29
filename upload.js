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

        const startTime = Date.now(); // 업로드 시작 시간 기록

        $.ajax({
            url: "https://api.nergis.dev/v1/file/upload",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: password ? { "x-password": password } : {},
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = (evt.loaded / evt.total) * 100;
                        $('#progressBar').css('width', percentComplete + '%');
                        $('#progressBar').text(percentComplete.toFixed(2) + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                const endTime = Date.now(); // 업로드 완료 시간 기록
                const duration = (endTime - startTime) / 1000; // 업로드 시간 (초)
                const totalSizeMB = Array.from(fileList).reduce((acc, file) => acc + file.size, 0) / (1024 * 1024); // 총 파일 크기 (MB)
                const uploadSpeed = (totalSizeMB / duration).toFixed(2); // 업로드 속도 (MB/s)

                $('#status').text("Done!");
                $('#progressBar').css('width', '100%');
                $('#progressBar').text('100%');
                $('#uploadSpeed').text(uploadSpeed); // 업로드 속도 표시
                $('#url').html('');
                for (let i = 0; i < response.file_direct.length; i++) {
                    const url = response.file_direct[i];
                    $.ajax({
                        url: "https://sqlr.kr/shorten",
                        type: "POST",
                        data: JSON.stringify({ url }),
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
                }
            }
        });
    });
});
