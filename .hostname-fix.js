const os = require('os');
const originalHostname = os.hostname;
os.hostname = function() { return 'MusclePC'; };
