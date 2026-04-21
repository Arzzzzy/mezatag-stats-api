import { handlePokemonStatsRequest } from '../../src/lib/mezatagStatsApi.js';

export default function handler(req, res) {
  handlePokemonStatsRequest(req, res, { slug: req.query.slug });
}
