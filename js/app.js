(function () { // AI-Assisted Code
    const STORAGE_KEY = "passnplay-parties";
    const MAX_PARTIES = 8;

    function loadParties() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveParties(list) {
        try {localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            return false;
        }
    }

    const section = document.getElementById("player-name-section");
    if (!section) return;

    const loadBlock = document.createElement("div");
    loadBlock.className = "parties";
    loadBlock.innerHTML = `
        <span class="party-label">Saved Parties</span>
        <div class="party-list"></div>
        <p class="party-empty">No saved parties yet.</p>
    `;

    const saveBlock = document.createElement("div");
    saveBlock.className = "parties";
    saveBlock.innerHTML = `
        <div class="party-save-row">
            <input type="text" class="party-name-input" placeholder="Save these names as..." maxlength="20">
            <button type="button" class="party-save-btn">Save</button>
        </div>
        <p class="setup-hint party-status hidden"></p>
    `;

    section.querySelector("h3").insertAdjacentElement("afterend", loadBlock);
    section.appendChild(saveBlock);

    const list = loadBlock.querySelector(".party-list");
    const emptyMsg = loadBlock.querySelector(".party-empty");
    const nameInput = saveBlock.querySelector(".party-name-input");
    const saveBtn = saveBlock.querySelector(".party-save-btn");
    const status = saveBlock.querySelector(".party-status");

    function showStatus(message) {
        status.textContent = message;
        status.classList.remove("hidden");
        setTimeout(() => status.classList.add("hidden"), 2500);
    }

    function renderParties() {
        const parties = loadParties();
        list.innerHTML = "";
        emptyMsg.classList.toggle("hidden", parties.length > 0);

        parties.forEach(party => {
            const chip = document.createElement("div");
            chip.className = "party-chip";

            const loadBtn = document.createElement("button");
            loadBtn.type = "button";
            loadBtn.className = "party-load-btn";
            loadBtn.textContent = `${party.name} (${party.players.length})`; 
            loadBtn.addEventListener("click", () => applyParty(party));

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "party-delete-btn";
            delBtn.setAttribute("aria-label", `Delete ${party.name}`);
            delBtn.textContent = "×";
            delBtn.addEventListener("click", () => {
                if (!confirm(`Delete the party "${party.name}"?`)) return;
                saveParties(loadParties().filter(p => p.id !== party.id));
                renderParties();
            });

            chip.append(loadBtn, delBtn);
            list.appendChild(chip);
        });
    }

    function applyParty(party) {
        const max = SETTINGS.maxPlayers;
        const min = SETTINGS.minPlayers;
        const names = party.players.slice(0, max);       // this game may support fewer players than the party has
        const count = Math.max(min, names.length);       // ...or more than the party has

        playerCountInput.value = count;
        handleSetupUpdates();                            // rebuilds the name inputs for the new count

        const inputs = document.querySelectorAll("#player-inputs input");
        inputs.forEach((input, i) => { input.value = names[i] || ""; });
        inputs[0].dispatchEvent(new Event("input", { bubbles: true })); // re-runs validateSetup()

        if (party.players.length > max) {
            showStatus(`This game fits ${max} players, so the last ${party.players.length - max} were left out.`);
        } else if (names.length < min) {
            showStatus(`This game needs at least ${min} players. Add the rest manually.`);
        }
    }

    function saveCurrentParty() {
        const partyName = nameInput.value.trim();
        const players = [...document.querySelectorAll("#player-inputs input")]
            .map(input => input.value.trim())
            .filter(Boolean);

        if (!partyName) { showStatus("Give your party a name first."); return; }
        if (players.length === 0) { showStatus("Enter at least one player name first."); return; }

        let parties = loadParties();
        const existing = parties.find(p => p.name.toLowerCase() === partyName.toLowerCase());

        if (existing) {
            existing.players = players;                  // same name = overwrite
        } else {
            if (parties.length >= MAX_PARTIES) { showStatus(`You can save up to ${MAX_PARTIES} parties. Delete one first.`); return; }
            parties.push({ id: Date.now(), name: partyName, players });
        }

        if (saveParties(parties)) {
            nameInput.value = "";
            renderParties();
            showStatus(existing ? "Party updated!" : "Party saved!");
        } else {
            showStatus("Couldn't save. Your browser may be blocking storage.");
        }
    }

    saveBtn.addEventListener("click", saveCurrentParty);
    renderParties();
})();