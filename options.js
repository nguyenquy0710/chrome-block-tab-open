document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['blacklist'], function (result) {
        document.getElementById('blacklist').value = result.blacklist;
    });
    document.getElementById('save').addEventListener('click', function () {
        var blacklist = document.getElementById('blacklist').value.split(',').map(function (item) {
            return item.trim();
        });
        chrome.storage.sync.set({ 'blacklist': blacklist }, function () {
            alert('Blacklist saved!');
        });
    });
});
