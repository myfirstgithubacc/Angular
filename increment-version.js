const fs = require('fs');
const path = require('path'),

	// environment = process.argv[2] || 'default',
	// versionFilePath = path.join(__dirname, 'src', 'assets', `version-${environment}.json`);
    versionFilePath = path.join(__dirname, 'src', 'assets', `version.json`);

fs.readFile(versionFilePath, 'utf8', (err, data) => {
	if (err) {
		if (err.code === 'ENOENT') {
			const initialVersion = { version: '1.0.0' };
			fs.writeFileSync(versionFilePath, JSON.stringify(initialVersion, null, 2), 'utf8');
			//console.log(`Created initial version file for ${environment}`);
			return;
		}
		console.error('Error reading version file:', err);
		process.exit(1);
	}

	const versionData = JSON.parse(data),
		[major, minor, patch] = versionData.version.split('.').map(Number),
		newVersion = `${major}.${minor}.${patch + 1}`;
	versionData.version = newVersion;

	fs.writeFile(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8', (err) => {
		if (err) {
			console.error('Error writing version file:', err);
			process.exit(1);
		}
		//console.log(`Version updated to ${newVersion} for ${environment}`);
	});
});
