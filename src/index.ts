import '../styles/main.scss';
import { Game } from './game';

var game = new Game(10, 20);
window.onload = game.init.bind(game);
