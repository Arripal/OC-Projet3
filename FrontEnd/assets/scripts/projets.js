const projets = await fetch('http://localhost:5678/api/works').then((projets) =>
	projets.json()
);

function createProjet(projet) {
	const figure = document.createElement('figure');

	const image = document.createElement('img');
	image.src = projet.imageUrl;

	const figcaption = document.createElement('figcaption');
	figcaption.innerText = projet.title;

	figure.appendChild(image);
	figure.appendChild(figcaption);

	return figure;
}

async function displayProjets(projets) {
	const gallery = document.querySelector('.gallery');
	try {
		projets.map((projets) => {
			gallery.appendChild(createProjet(projets));
		});
	} catch (error) {
		const errorSpan = document.createElement('span');
		errorSpan.classList.add('span-error');
		errorSpan.innerText =
			"Impossible d'afficher les projets, veuillez essayer à nouveau dans quelques minutes.";
		gallery.appendChild(errorSpan);
	}
}

displayProjets(projets);

// Mise en place du filtrage

const filtres = document.querySelectorAll('.filtre');

function filtrerProjets(projets, id) {
	const projetsFiltres = projets.filter((projet) => projet.categoryId === id);

	return projetsFiltres;
}

filtres.forEach((filtre) => {
	filtre.addEventListener('click', (e) => {
		const gallery = document.querySelector('.gallery');
		gallery.innerHTML = '';
		const id = Number(e.target.dataset.id);

		//Ajout de la class active

		document.querySelector('.active')?.classList.remove('active');
		e.target.classList.add('active');

		if (id === 0) {
			displayProjets(projets);
		} else {
			const projetsFiltres = filtrerProjets(projets, id);
			displayProjets(projetsFiltres);
		}
	});
});
