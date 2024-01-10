import { afficherProjets } from './projets.js';

export function toggleModal() {
	const modal_container = document.querySelector('.modal-container');
	const modal_triggers = document.querySelectorAll('.trigger-modal');
	modal_triggers.forEach((trigger) =>
		trigger.addEventListener('click', () => {
			modal_container.classList.toggle('modal-visible');
		})
	);
}

const gallery = document.querySelector('.modal-gallery');

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
	delete_btn_container.appendChild(delete_btn);

	figure.appendChild(image);
	figure.appendChild(delete_btn_container);
	return figure;
}

function afficherForm() {
	const form = document.querySelector('.modal-form-content');
	const gallery_content = document.querySelector('.modal-gallery-content');
	form.style.display = 'block';
	gallery_content.style.display = 'none';
}

const projets = await fetch('http://localhost:5678/api/works').then((projets) =>
	projets.json()
);

afficherProjets(projets, gallery, creerProjetModal);

document
	.querySelector('.modal-add-photo')
	.addEventListener('click', afficherForm);
