const projets = await fetch('http://localhost:5678/api/works').then((projets) =>
	projets.json()
);

function creerProjet(projet) {
	const figure = document.createElement('figure');

	const image = document.createElement('img');
	image.src = projet.imageUrl;

	const figcaption = document.createElement('figcaption');
	figcaption.innerText = projet.title;

	figure.appendChild(image);
	figure.appendChild(figcaption);

	return figure;
}

function afficherProjets(projets) {
	const gallery = document.querySelector('.gallery');
	try {
		projets.map((projets) => {
			gallery.appendChild(creerProjet(projets));
		});
	} catch (error) {
		const errorSpan = document.createElement('span');
		errorSpan.classList.add('span-error');
		errorSpan.innerText =
			"Impossible d'afficher les projets, veuillez essayer à nouveau dans quelques minutes.";
		gallery.appendChild(errorSpan);
	}
}

afficherProjets(projets);

// Mise en place du filtrage

const filtres = document.querySelectorAll('.filtre');

function filtrerProjets(projets, id) {
	const projetsFiltres = projets.filter((projet) => projet.categoryId === id);

	return projetsFiltres;
}

filtres.forEach((filtre) => {
	filtre.addEventListener('click', (e) => {
		//Reset du contenu HTML de la gallery

		const gallery = document.querySelector('.gallery');
		gallery.innerHTML = '';

		//Ajout de la class active

		document.querySelector('.active')?.classList.remove('active');
		filtre.classList.add('active');

		const id = Number(filtre.dataset.id);

		if (id === 0) {
			afficherProjets(projets);
		} else {
			const projetsFiltres = filtrerProjets(projets, id);
			afficherProjets(projetsFiltres);
		}
	});
});
