import { afficherProjets, getIdentificationToken } from './projets.js';
const content_triggers = document.querySelectorAll('.trigger-modal-content');
const gallery = document.querySelector('.modal-gallery');
const content_containers = document.querySelectorAll('.content-wrapper');
const token_identification = getIdentificationToken();

export function toggleModal() {
	const modal_container = document.querySelector('.modal-container');
	const modal_triggers = document.querySelectorAll('.trigger-modal');

	let isOpen = false;

	modal_triggers.forEach((trigger) =>
		trigger.addEventListener('click', () => {
			isOpen = !isOpen;

			modal_container.classList.toggle('modal-visible');

			if (!isOpen) {
				content_containers[0].style.display = 'block';
				content_containers[1].style.display = 'none';
			}
		})
	);
}

function afficherForm() {
	content_containers.forEach((container) => {
		let display_value = container.style.display === 'block' ? 'none' : 'block';
		container.style.display = display_value;
	});
}

function afficherCategories(categories) {
	const form_categories = document.querySelector('select');

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

async function ajouterProjet(form_data) {
	const reponse = await fetch('http://localhost:5678/api/works', {
		method: 'POST',
		body: JSON.stringify(form_data),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token_identification.token}`,
		},
	});
	if (reponse.status === 200) {
		console.log('Projet ajouté !');
	} else {
		console.log('ERROR !!!!');
	}
}

// Exécution du code uniquement si l'admin du site est connectée

if (token_identification.token) {
	const projets = await fetch('http://localhost:5678/api/works').then(
		(projets) => projets.json()
	);

	const categories = await fetch('http://localhost:5678/api/categories').then(
		(categories) => categories.json()
	);

	const delete_projets_boutons = document.querySelectorAll(
		'.delete-projet-modal'
	);

	content_triggers.forEach((trigger) => {
		trigger.addEventListener('click', afficherForm);
	});

	afficherCategories(categories);

	afficherProjets(projets, gallery, creerProjetModal);

	/****** Suppression des projets  ******/

	delete_projets_boutons.forEach((delete_btn) => {
		delete_btn.addEventListener('click', async function supprimerProjet(event) {
			event.preventDefault();
			try {
				const projet_id = parseInt(event.target.dataset.id);

				const reponse = await fetch(
					`http://localhost:5678/api/works/${projet_id}`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${token_identification.token}`,
						},
					}
				);
				if (reponse.status === 200) {
					//Afficher une liste a jour des projets
					console.log('Delete  worked');

					gallery.innerHTML = '';
					const liste_projets = projets.filter(
						(projet) => projet.id !== projet_id
					);
					console.log(liste_projets);
					afficherProjets(liste_projets, gallery, creerProjetModal);
				} else {
					console.log(reponse.body);
				}
				//Gestion d'erreur fetch
			} catch (error) {
				console.log('error : ', error);
			}
		});
	});

	const ajout_photo = document.querySelector('.form-ajout-photo-input');

	/*************** Récupération de l'id de la catégorie choisie *******/

	let menu = document.getElementById('photo-categorie');

	menu.addEventListener('change', function (event) {
		let selectedOption = event.target.options[event.target.selectedIndex];
		let categorieId = selectedOption.dataset.categorie;
		window.localStorage.setItem('categorieId', categorieId);
	});
	/******* Ajout des travaux ********/

	ajout_photo.addEventListener('click', async function (event) {
		try {
			event.preventDefault();

			// Recuperation des infos du formulaire

			const form = document.querySelector('#add-photo');
			const title = form.querySelector('#photo-title').value;
			const photo = form.querySelector('#photo').value;
			let id = window.localStorage.getItem('categorieId');
			window.localStorage.removeItem('categorieId');

			const formData = new FormData();
			formData.append('title', title);
			formData.append('categorieId', Number(id));
			formData.append('imageUrl', photo);
			const entries = formData.entries();

			for (const entry of entries) {
				const [key, valeur] = entry;
				console.log(`key: ${key}, valeur: ${valeur}`);
			}

			const reponse = await fetch(`http://localhost:5678/api/works`, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token_identification}`,
				},
				body: formData,
			});
			if (reponse.status === 200) {
				console.log('Projet ajouté !');
			} else {
				console.log('ERROR !!!!');
			}
			console.log(reponse);
		} catch (error) {
			console.log('error : ' + error);
		}
	});
}

//TODO : Ajouter le bandeau lorsque l'admin est connecté
// TODO : Mettre en place l'ajout et la suppression des projets
