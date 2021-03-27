module.exports = getDate;

function getDate() {
    var day = new Date().toLocaleDateString('en-us', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    return day;
}