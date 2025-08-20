function formatMsToMinutesSeconds(ms) {
    if (!ms || ms < 0) return "0 minutes 0 seconds";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} minutes ${seconds} seconds`;
};

module.exports = {formatMsToMinutesSeconds}