/*
 * Copyright(C) 2023 AllStarLink
 * Allmon3 and all components are Licensed under the AGPLv3
 * see https://raw.githubusercontent.com/AllStarLink/Allmon3/develop/LICENSE
 * 
 * This excludes the use of the Bootstrap libraries which are licensed 
 * separately.
 *
 */

//
// General Send Command
//
async function sendCommand(node, cmdStr) {
	const cmdForm = new FormData();
	cmdForm.append('node', node);
	cmdForm.append('cmd', cmdStr);

	let cmdout = await postAPIForm("api/asl-cmdlink.php", cmdForm);
	let res = "";
	if( cmdout["SUCCESS"] ){
		let out = atob(cmdout["SUCCESS"]);
		res = `
			<div class="alert alert-success" role="alert">Command Successful</div>
			<pre>${out}<pre>
		`;
	} else if ( cmdout["SECURITY"] ){
		let out = cmdout["SECURITY"];
		res = `
            <div class="alert alert-danger" role="alert">Security Error</div>
            <pre>${out}<pre>
        `;
	} else {
		let out = atob(cmdout["ERROR"]);
		res = `
			<div class="alert alert-danger" role="alert">Command Error</div>
			<pre>${out}<pre>
		`;
	}

	document.getElementById("command-modal-body").innerHTML = res;
}

//
// Command Handling
//
function openCmdModalLink(node){
	const modal = new bootstrap.Modal(document.getElementById("commandModal"), {});
		document.getElementById("commandModalTitleBox").innerHTML = `Execute Command on ${node}`;
	if(loggedIn){
		document.getElementById("command-modal-body").innerHTML = getLinkCommandModalForm(node);
	} else {
		document.getElementById("command-modal-body").innerHTML = `<div class="alert alert-danger role="alert">Must Logon First</div>`;	
	}
	modal.show();
}

function openCmdModalCLI(node){
	const modal = new bootstrap.Modal(document.getElementById("commandModal"), {});
	document.getElementById("commandModalTitleBox").innerHTML = `Execute Command on ${node}`;
	if(loggedIn){
		document.getElementById("command-modal-body").innerHTML = getCLICommandModalForm(node);
	} else {
		document.getElementById("command-modal-body").innerHTML = `<div class="alert alert-danger role="alert">Must Logon First</div
>`;
	}
	modal.show();
}


//
// Link Command Modal Interface
//
function getLinkCommandModalForm(node){
	return `
<div class="container-fluid">
	<form id="command-modal-form">
		<div class="row mb-2 align-items-center">
			<div class="col-4 fw-bolder text-end">
				<label for="cmf-link-node-cmd">Command</label>
			</div>
			<div class="col-8">
				<select id="cmf-link-node-cmd" name="cmf-link-node-cmd" class="form-select"
						aria-label="Connect Disconnect command">
					<option selected>Choose a command</option>
					<option value="rpt cmd ${node} ilink 3">Connect</option>
					<option value="rpt cmd ${node} ilink 1">Disconnect</option>
					<option value="rpt cmd ${node} ilink 6">Disconnect All</option>
					<option value="rpt cmd ${node} ilink 2">Connect - Monitor Only</option>
					<option value="rpt cmd ${node} ilink 13">Connect Permanent</option>
					<option value="rpt cmd ${node} ilink 12">Connect Permanent - Monitor Only</option>
					<option value="rpt cmd ${node} ilink 11">Disconnect Permanent</option>
					<option value="rpt cmd ${node} ilink 8">Local Monitor</option>
					<option value="rpt cmd ${node} ilink 18">Local Monitor Permanent</option>
				</select>
			</div>
		</div>
		<div class="row mb-2 align-items-center">
			<div class="col-4 fw-bolder text-end">
				<label for="cmf-link-node-num">Node #</label>
			</div>
			<div class="col-8">
				<input id="cmf-link-node-num" name="cmf-link-node-num" class="form-control" type="text">
			</div>
		</div>
		<div class="row mb-2 align-middle">
			<div class="col-4">
			</div>
			<div class="col-8">
				<button type="button" class="btn btn-secondary" onclick="executeNodeLinkCmd(${node})">Execute</button>
			</div>
		</div>
	<form>
</div>

`;
}

function executeNodeLinkCmd(node){
	let command = document.getElementById("cmf-link-node-cmd").value;
	let linknode = document.getElementById("cmf-link-node-num").value;
	if(linknode === ""){
		linknode = "0";
	}
	sendCommand(node, `${command} ${linknode}`);	
}

//
// CLI Command Modal Interface
//
function getCLICommandModalForm(node){
	return `
<div class="container-fluid">
	<form id="command-modal-form">
		<div class="row mb-2 align-items-center">
			<div class="col-4 fw-bolder text-end">
				<label for="cmf-cmd-node-select">Command Template</label>
			</div>
			<div class="col-8">
                <select id="cmf-cmd-node-select" name="cmf-cmd-node-select"
						class="form-select" aria-label="system command" onchange="buildCLICommandModalCmd()">
                    <option selected>Choose a command</option>
                    <option value="rpt stats ${node}">Show Node Status</option>
                    <option value="core show uptime">Show Uptime</option>
                    <option value="iax2 show registry">Show IAX Registry</option>
                    <option value="iax2 show channels">Show IAX Channels</option>
                    <option value="iax2 show netstats">Show Network Status</option>
                    <option value="rpt lstats ${node}">Show Link Status</option>
                    <option value="rpt show registrations">Show HTTP Registrations</option>
					<option value="custom">Custom command</option>
				</select>
			</div>
		</div>
		<div class="row mb-2 align-items-center">
			<div class="col-4 fw-bolder text-end">
				<label for="cmf-cmd-node-cmd">Custom Command</label>
			</div>
			<div class="col-8">
				<input id="cmf-cmd-node-cmd" type="text" size="100" class="from-control" readonly>
			</div>
		</div>
		<div class="row mb-2 align-middle">
			<div class="col-4">
			</div>
			<div class="col-8">
				<button type="button" class="btn btn-secondary" onclick="executeNodeCLICmd(${node})">Execute</button>
			</div>
		</div>
	<form>
</div>

`;
}

function buildCLICommandModalCmd(node){
	let cmfSel = document.getElementById("cmf-cmd-node-select");
	let cmfCmd = document.getElementById("cmf-cmd-node-cmd");
	if(cmfSel.value === "custom"){
		cmfCmd.value = "";
		cmfCmd.readOnly = false;
	} else {
		cmfCmd.value = cmfSel.value;
		cmfCmd.readOnly = true;
	}
}

function executeNodeCLICmd(node){
	let command = document.getElementById("cmf-cmd-node-cmd").value;
	sendCommand(node, `${command}`);	
}
