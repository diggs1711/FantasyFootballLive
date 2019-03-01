import fetch from 'cross-fetch';

export async function getBootstrapData() {
	const data = await fetch('https://fantasy.premierleague.com/drf/bootstrap-static');
	return await data.json();
}
