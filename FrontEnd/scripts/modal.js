import {
	afficherProjets,
	creerProjet,
	getIdentificationToken,
} from './projets.js';

let token_identification = getIdentificationToken();
let is_modal_open = false;

const gallery = document.querySelector('.modal-gallery');
let menu = document.getElementById('photo-categorie');
const ajout_photo = document.querySelector('.form-ajout-photo-input');

async function getProjets() {
	const projets = await fetch('http://localhost:5678/api/works').then(
		(projets) => projets.json()
	);
	return projets;
}

function resetModalContent(modal_state) {
	const content_containers = document.querySelectorAll('.content-wrapper');

	if (!modal_state) {
		afficherMessage();
		content_containers[0].style.display = 'block';
		content_containers[1].style.display = 'none';
	}
}

export function toggleModal() {
	const modal_container = document.querySelector('.modal-container');
	const modal_triggers = document.querySelectorAll('.trigger-modal');

	modal_triggers.forEach((trigger) =>
		trigger.addEventListener('click', (event) => {
			event.stopPropagation();

			is_modal_open = !is_modal_open;

			modal_container.classList.toggle('modal-visible');
			//Reset du contenu de la modal lors de sa fermeture
			resetModalContent(is_modal_open);
		})
	);
}

function afficherMessage(messageString = '') {
	const message = document.querySelector('.message');
	message.innerText = `${messageString}`;
	return message;
}

function afficherForm() {
	const content_containers = document.querySelectorAll('.content-wrapper');
	content_containers.forEach((container) => {
		let display_valeur = container.style.display === 'block' ? 'none' : 'block';
		container.style.display = display_valeur;
	});
}
async function ajouterProjet(token_identification) {
	const form = document.querySelector('#add-photo');
	const title = form.querySelector('#photo-title')?.value;
	const image = form.querySelector('#photo')?.files[0];

	let id = window.localStorage.getItem('categorieId');
	window.localStorage.removeItem('categorieId');

	// Cas d'erreurs

	if (!title || !image || !id) {
		const message = afficherMessage(
			'Veuillez remplir touts les champs du formulaires.'
		);
		form.appendChild(message);
		return;
	}

	const formData = new FormData();
	formData.append('title', title);
	formData.append('category', id);
	formData.append('image', image);
	try {
		const reponse = await fetch('http://localhost:5678/api/works', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token_identification.token}` },
			body: formData,
		});

		if (!reponse.ok) {
			console.log("Erreur, impossible d'ajouter votre projet");
			return;
		}

		form.querySelector('#photo-title').value = '';
		return true;
	} catch (error) {
		console.log("Erreur pendant l'exécution de la requête :", error);
	}
}
async function afficherCategories() {
	const form_categories = document.querySelector('select');

	const categories = await fetch('http://localhost:5678/api/categories').then(
		(categories) => categories.json()
	);
	const option = document.createElement('option');
	option.innerText = '';
	option.selected = true;
	option.disabled = true;
	form_categories.appendChild(option);

	categories.map((categorie) => {
		const option = document.createElement('option');
		option.classList.add('select-option');
		option.value = categorie.name;
		option.innerText = categorie.name;
		option.dataset.categorie = categorie.id;

		form_categories.appendChild(option);
	});
}

function creerProjetModal(projet) {
	const figure = document.createElement('figure');
	figure.classList.add('modal-figure');

	const image = document.createElement('img');
	image.src = projet.imageUrl;
	image.classList.add('modal-image');

	const delete_btn_container = document.createElement('div');
	delete_btn_container.classList.add('delete_btn_container');

	const delete_btn = document.createElement('input');
	delete_btn.classList.add('delete-projet-modal');
	delete_btn.type = 'button';
	delete_btn.dataset.id = projet.id;
	delete_btn_container.appendChild(delete_btn);

	figure.appendChild(image);
	figure.appendChild(delete_btn_container);

	return figure;
}

async function supprimerProjet(event, token_identification) {
	try {
		const projet_id = Number(event.target.dataset.id);

		const reponse = await fetch(
			`http://localhost:5678/api/works/${projet_id}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token_identification.token}`,
				},
			}
		);
		if (!reponse.ok) {
			console.log(
				'Impossible de supprimer votre projet. Veuillez reessayer plus tard.'
			);
			return;
		}

		return true;
	} catch (error) {
		console.log('error: : ', error);
	}
}

function getCategoryId(event) {
	let selectedOption = event.target.options[event.target.selectedIndex];
	let categorieId = selectedOption.dataset.categorie;
	window.localStorage.setItem('categorieId', categorieId);
}
// Exécution du code uniquement si l'admin du site est connectée

if (token_identification) {
	afficherCategories();

	const projets = await getProjets();

	afficherProjets(projets, gallery, creerProjetModal);

	/*************** Récupération de l'id de la catégorie choisie *******/

	menu.addEventListener('change', getCategoryId);

	/******* Ajout des travaux ********/

	ajout_photo.addEventListener('click', async (event) => {
		event.preventDefault();

		try {
			const isAdded = await ajouterProjet(token_identification);

			if (!isAdded) {
				alert("Impossible d'ajouter votre projet pour le moment.");
				return;
			}

			const projets = await getProjets();
			const main_gallery = document.querySelector('.gallery');

			afficherProjets(projets, gallery, creerProjetModal);

			afficherProjets(projets, main_gallery, creerProjet);

			// Affichage d'un message de succes, puis reset

			afficherMessage('Votre projet a bien été ajouter.');

			setTimeout(() => {
				afficherMessage();
			}, 2000);
		} catch (error) {
			console.log('error', error);
		}
	});

	/****** Suppression des projets  ******/

	const delete_projets_boutons = document.querySelectorAll(
		'.delete-projet-modal'
	);

	delete_projets_boutons.forEach((delete_btn) => {
		delete_btn.addEventListener('click', async (event) => {
			event.preventDefault();

			try {
				const isDeleted = await supprimerProjet(event, token_identification);
				if (!isDeleted) {
					alert('Impossible de supprimer votre projet pour le moment.');
					return;
				}

				const projets = await getProjets();
				const main_gallery = document.querySelector('.gallery');

				afficherProjets(projets, gallery, creerProjetModal);
				afficherProjets(projets, main_gallery, creerProjet);
			} catch (error) {
				console.log(error);
			}
		});
	});

	const content_triggers = document.querySelectorAll('.trigger-modal-content');

	content_triggers.forEach((trigger) => {
		trigger.addEventListener('click', afficherForm);
	});
}
