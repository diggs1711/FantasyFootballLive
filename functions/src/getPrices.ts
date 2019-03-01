import { getBootstrapData } from "./getData";
import { Player } from "./Player";

export async function getCurrentPrices() {
    const data = await getBootstrapData();
    const players = data.elements;
    let result = [];

    for(let player of players) {
        result.push(new Player(player.id, player.web_name, player.now_cost))
    }

    return result;
}

export function getYesterdaysPrices(database: any) {
    return database
            .ref('fantasy-football-live')
            .child('player-prices')
            .once('value')
            .then((players: { val: () => void; }) => players.val());
}
