let resources = [];
let editingResourceId = null;

const resourceForm = document.querySelector("#resource-form");
const resourcesTbody = document.querySelector("#resources-tbody");
const titleInput = document.querySelector("#resource-title");
const descriptionInput = document.querySelector("#resource-description");
const linkInput = document.querySelector("#resource-link");
const submitButton = document.querySelector("#add-resource");

function createResourceRow(resource) {
  const row = document.createElement("tr");

  const titleCell = document.createElement("td");
  titleCell.textContent = resource.title;

  const descriptionCell = document.createElement("td");
  descriptionCell.textContent = resource.description || "";

  const linkCell = document.createElement("td");
  linkCell.textContent = resource.link;

  const actionsCell = document.createElement("td");

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "edit-btn";
  editButton.dataset.id = resource.id;
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.dataset.id = resource.id;
  deleteButton.textContent = "Delete";

  actionsCell.append(editButton, deleteButton);
  row.append(titleCell, descriptionCell, linkCell, actionsCell);
  return row;
}

function renderTable(resourceList = resources) {
  resourcesTbody.innerHTML = "";
  resourceList.forEach((resource) => {
    resourcesTbody.appendChild(createResourceRow(resource));
  });
}

function resetFormMode() {
  editingResourceId = null;
  submitButton.textContent = "Add Resource";
  resourceForm.reset();
}

function handleAddResource(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const link = linkInput.value.trim();

  if (editingResourceId !== null) {
    fetch("./api/index.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingResourceId, title, description, link }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          resources = resources.map((resource) =>
            String(resource.id) === String(editingResourceId)
              ? { ...resource, title, description, link }
              : resource
          );
          renderTable();
          resetFormMode();
        }
      });
    return;
  }

  fetch("./api/index.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, link }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        resources.push({ id: result.id, title, description, link });
        renderTable();
        resourceForm.reset();
      }
    });
}

function handleTableClick(event) {
  const target = event.target;

  if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    fetch(`./api/index.php?id=${id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          resources = resources.filter((resource) => String(resource.id) !== String(id));
          renderTable();
        }
      });
  }

  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    const resource = resources.find((item) => String(item.id) === String(id));
    if (!resource) {
      return;
    }

    editingResourceId = id;
    titleInput.value = resource.title;
    descriptionInput.value = resource.description || "";
    linkInput.value = resource.link;
    submitButton.textContent = "Update Resource";
  }
}

async function loadAndInitialize() {
  const response = await fetch("./api/index.php");
  const result = await response.json();
  resources = result.data || [];
  renderTable();

  if (!loadAndInitialize._listenersAttached) {
    resourceForm.addEventListener("submit", handleAddResource);
    resourcesTbody.addEventListener("click", handleTableClick);
    loadAndInitialize._listenersAttached = true;
  }
}

loadAndInitialize();
