import { afficherProjets, getIdentificationToken } from './projets.js';
const content_triggers = document.querySelectorAll('.trigger-modal-content');
const gallery = document.querySelector('.modal-gallery');
const content_containers = document.querySelectorAll('.content-wrapper');

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

const projets = await fetch('http://localhost:5678/api/works').then((projets) =>
	projets.json()
);

content_triggers.forEach((trigger) => {
	trigger.addEventListener('click', afficherForm);
});

afficherProjets(projets, gallery, creerProjetModal);

//TODO : Styliser le select/ Récuperer les differentes categories et les afficher dans le select
// TODO : Trouver une solution pour importer les projets depuis projets.js vers modal.js
// TODO : Mettre en place l'ajout et la suppression des projets

/********** Suppression des projets **********/

const delete_projets_boutons = document.querySelectorAll(
	'.delete-projet-modal'
);

delete_projets_boutons.forEach((delete_btn) => {
	delete_btn.addEventListener('click', async function supprimerProjet(event) {
		event.preventDefault();
		try {
			const projet_id = parseInt(event.target.dataset.id);
			const token_identification = getIdentificationToken();
			console.log(token_identification);
			const reponse = await fetch(
				`http://localhost:5678/api/works/${projet_id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `${token_identification}`,
					},
				}
			);
			if (reponse.status === 200) {
				//Afficher une liste a jour des projets
				console.log('Delete  worked');
				/*
				gallery.innerHTML = '';
				const liste_projets = projets.filter(
					(projet) => projet.id !== projet_id
				);
				console.log(liste_projets);
				afficherProjets(liste_projets, gallery, creerProjetModal);
				*/
			} else {
				console.log(reponse.body);
			}
			//Gestion d'erreur fetch
		} catch (error) {
			console.log('error : ', error);
		}
	});
});
