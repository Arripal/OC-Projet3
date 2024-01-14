import { afficherProjets, getIdentificationToken } from './projets.js';

let token_identification = getIdentificationToken();
let is_modal_open = false;
const error = document.querySelector('.span-error');
const content_containers = document.querySelectorAll('.content-wrapper');
const gallery = document.querySelector('.modal-gallery');
let menu = document.getElementById('photo-categorie');
const ajout_photo = document.querySelector('.form-ajout-photo-input');

async function getProjets() {
	const projets = await fetch('http://localhost:5678/api/works').then(
		(projets) => projets.json()
	);
	return projets;
}

export function toggleModal() {
	const modal_container = document.querySelector('.modal-container');
	const modal_triggers = document.querySelectorAll('.trigger-modal');

	modal_triggers.forEach((trigger) =>
		trigger.addEventListener('click', (event) => {
			is_modal_open = !is_modal_open;
			event.stopPropagation();
			modal_container.classList.toggle('modal-visible');

			if (!is_modal_open) {
				error.innerText = '';
				content_containers[0].style.display = 'block';
				content_containers[1].style.display = 'none';
			}
		})
	);
}

function afficherForm() {
	content_containers.forEach((container) => {
		let display_valeur = container.style.display === 'block' ? 'none' : 'block';
		container.style.display = display_valeur;
	});
}
async function ajouterProjet() {
	// Recuperation des infos du formulaire

	const form = document.querySelector('#add-photo');
	const title = form.querySelector('#photo-title')?.value;
	const image = form.querySelector('#photo').files[0];

	let id = window.localStorage.getItem('categorieId');
	console.log(title, image, id);
	window.localStorage.removeItem('categorieId');
	// Cas d'erreurs
	if (!title || !image || !id) {
		const error = document.querySelector('.span-error');
		error.innerText = 'Veuillez remplir touts les champs du formulaires.';
		form.appendChild(error);
		return;
	}

	const formData = new FormData();
	formData.append('title', title);
	formData.append('category', id);
	formData.append('image', image);
	const reponse = await fetch('http://localhost:5678/api/works', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token_identification}` },
		body: formData,
	});

	if (!reponse.ok) {
		console.log("Erreur, impossible d'ajouter votre projet");
		return;
	}

	const projets = await getProjets();

	afficherProjets(projets, gallery, creerProjetModal);
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

	const delete_btn = document.createElement('button');
	delete_btn.classList.add('delete-projet-modal');
	delete_btn.dataset.id = projet.id;
	delete_btn_container.appendChild(delete_btn);

	figure.appendChild(image);
	figure.appendChild(delete_btn_container);

	return figure;
}

async function supprimerProjet(event) {
	try {
		const projet_id = Number(event.target.dataset.id);

		const reponse = await fetch(
			`http://localhost:5678/api/works/${projet_id}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token_identification}`,
				},
			}
		);
		return reponse.ok ? true : false;
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
	token_identification = token_identification.token;

	afficherCategories();
	const projets = await getProjets();
	afficherProjets(projets, gallery, creerProjetModal);

	/*************** Récupération de l'id de la catégorie choisie *******/

	menu.addEventListener('change', getCategoryId);

	/******* Ajout des travaux ********/

	ajout_photo.addEventListener('click', async (event) => {
		event.preventDefault();
		event.stopPropagation();
		await ajouterProjet();
	});

	/****** Suppression des projets  ******/

	const delete_projets_boutons = document.querySelectorAll(
		'.delete-projet-modal'
	);

	delete_projets_boutons.forEach((delete_btn) => {
		delete_btn.addEventListener('click', async (event) => {
			event.preventDefault();
			event.stopPropagation();
			const isDeleted = await supprimerProjet(event);
			if (!isDeleted) return;
			const projets = await getProjets();
			afficherProjets(projets, gallery, creerProjetModal);
		});
	});

	const content_triggers = document.querySelectorAll('.trigger-modal-content');

	content_triggers.forEach((trigger) => {
		trigger.addEventListener('click', afficherForm);
	});
}
