function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "nl.fokkezb.toast/" + s : s.substring(0, index) + "/nl.fokkezb.toast/" + s.substring(index + 1);
    return path;
}

module.exports = [];