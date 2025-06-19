// Create new instance of DiscordFlags
const flags = new DiscordFlags();

async function calculateFlags(e) {
    e.preventDefault();
    const result = document.getElementById("result");
    result.innerHTML = "N/A";
    try {
        const flagNum = BigInt(document.getElementById("flags").value);
        const userResult = await flags.getFlags(flagNum, 'user');
        const appResult = await flags.getFlags(flagNum, 'application');
        result.innerHTML = `<b>User:</b> ${userResult}<br><b>Application:</b> ${appResult}`;
    } catch (e) {
        result.innerHTML = "Bad flag number";
        console.warn(e);
    }
}

const undocumented = `<span class="icon">
    <span class="fa-stack" style="font-size: 8px;" data-tooltip="This flag is undocumented.">
        <i class="fas fa-file fa-stack-2x"></i>
        <i class="fas fa-times fa-stack-1x fa-inverse" style="padding-top: 2px;"></i>
    </span>
</span>`;

const deprecated = `<span class="icon">
    <span class="fa-stack" style="font-size: 8px;" data-tooltip="This flag is deprecated.">
        <i class="fas fa-file fa-stack-2x"></i>
        <i class="fas fa-times fa-stack-1x fa-inverse" style="color: red; padding-top: 2px;"></i>
    </span>
</span>`;

const userTable = document.getElementById("userFlags").getElementsByTagName("tbody")[0];
const applicationTable = document.getElementById("applicationFlags").getElementsByTagName("tbody")[0];

function insertFlag(flag, table, flagData) {
    const row = table.insertRow(-1);
    const flagName = row.insertCell(0);
    const flagValue = row.insertCell(1);
    const flagDesc = row.insertCell(2);

    flagName.innerHTML = flag;
    if (flagData.undocumented) flagName.innerHTML += undocumented;
    if (flagData.deprecated) flagName.innerHTML += deprecated;

    flagValue.innerHTML = `${flagData.value} (1 << ${flagData.bitshift})`;
    flagDesc.innerHTML = flagData.description;
}

async function initialize() {
    // Changed to await flag details
    const userFlags = await flags.getFlagDetails('user');
    const appFlags = await flags.getFlagDetails('application');

    // Populate tables
    for (const [flag, data] of Object.entries(userFlags)) {
        insertFlag(flag, userTable, {
            description: data.description,
            bitshift: data.bitshift,
            value: data.value,
            undocumented: data.undocumented,
            deprecated: data.deprecated ?? false
        });
    }
    for (const [flag, data] of Object.entries(appFlags)) {
        insertFlag(flag, applicationTable, {
            description: data.description,
            bitshift: data.bitshift,
            value: data.value,
            undocumented: data.undocumented,
            deprecated: data.deprecated ?? false
        });
    }
    
    document.getElementById("userLoading").style.display = "none";
    document.getElementById("applicationLoading").style.display = "none";
}

// Initialize and set up form
initialize();
document.getElementById("flagForm").addEventListener("submit", (e) => {
    calculateFlags(e).catch(console.error);
});
document.getElementById("flagFormSubmit").removeAttribute("disabled");
