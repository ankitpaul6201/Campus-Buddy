const University = require('../models/University');
const College = require('../models/College');
const cacheService = require('../cache/cacheService');

// Common Indian educational acronyms mapped to full names
const INDIAN_ACRONYMS = {
  'sviet': 'Swami Vivekanand Institute of Engineering',
  'cu': 'Chandigarh University',
  'pu': 'Panjab University',
  'pec': 'Punjab Engineering College',
  'tiet': 'Thapar Institute',
  'thapar': 'Thapar',
  'chitkara': 'Chitkara',
  'vit': 'Vellore Institute of Technology',
  'iit': 'Indian Institute of Technology',
  'nit': 'National Institute of Technology',
  'iiit': 'Indian Institute of Information Technology',
  'bits': 'Birla Institute of Technology',
  'dtu': 'Delhi Technological University',
  'du': 'University of Delhi',
  'mahe': 'Manipal Academy of Higher Education',
  'bhu': 'Banaras Hindu University',
  'jnu': 'Jawaharlal Nehru University',
  'amu': 'Aligarh Muslim University',
  'lpu': 'Lovely Professional University',
  'srm': 'SRM University',
  'jntu': 'Jawaharlal Nehru Technological University',
  'anna': 'Anna University',
  'amity': 'Amity University',
  'iisc': 'Indian Institute of Science',
  'iim': 'Indian Institute of Management',
  'aiims': 'All India Institute of Medical Sciences',
  'nsut': 'Netaji Subhas',
  'igdtuw': 'Indira Gandhi Delhi Technical University'
};

/**
 * GET /api/universities
 * Search across universities and colleges with 1-hour in-memory caching
 */
async function searchUniversities(req, res, next) {
  try {
    const { q, state, limit } = req.query;
    const trimmedQ = q && typeof q === 'string' ? q.trim() : '';

    if (!trimmedQ || trimmedQ.length < 2) {
      return res.json({
        success: true,
        count: 0,
        universities: []
      });
    }

    const maxLimit = limit ? Math.min(parseInt(limit, 10), 150) : 100;
    const cacheKey = `uni_search:${trimmedQ.toLowerCase()}:${(state || '').toLowerCase()}:${maxLimit}`;

    const cachedResults = await cacheService.getOrFetch(cacheKey, async () => {
      const tokens = trimmedQ.split(/\s+/).filter(Boolean);

      const buildUniTokenFilter = (token) => {
        const lower = token.toLowerCase();
        const exp = INDIAN_ACRONYMS[lower];
        const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const orArr = [
          { name: { $regex: new RegExp(esc, 'i') } },
          { city: { $regex: new RegExp(esc, 'i') } },
          { state: { $regex: new RegExp(esc, 'i') } }
        ];
        if (exp) {
          const expEsc = exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orArr.push({ name: { $regex: new RegExp(expEsc, 'i') } });
        }
        return { $or: orArr };
      };

      const buildCollegeTokenFilter = (token) => {
        const lower = token.toLowerCase();
        const exp = INDIAN_ACRONYMS[lower];
        const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const orArr = [
          { name: { $regex: new RegExp(esc, 'i') } },
          { rawName: { $regex: new RegExp(esc, 'i') } },
          { city: { $regex: new RegExp(esc, 'i') } },
          { district: { $regex: new RegExp(esc, 'i') } },
          { state: { $regex: new RegExp(esc, 'i') } },
          { universityName: { $regex: new RegExp(esc, 'i') } }
        ];
        if (exp) {
          const expEsc = exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orArr.push({ name: { $regex: new RegExp(expEsc, 'i') } });
          orArr.push({ rawName: { $regex: new RegExp(expEsc, 'i') } });
        }
        return { $or: orArr };
      };

      const uniQuery = tokens.length > 1
        ? { $and: tokens.map(buildUniTokenFilter) }
        : buildUniTokenFilter(trimmedQ);

      const collegeQuery = tokens.length > 1
        ? { $and: tokens.map(buildCollegeTokenFilter) }
        : buildCollegeTokenFilter(trimmedQ);

      if (state && typeof state === 'string' && state.trim()) {
        uniQuery.state = { $regex: new RegExp(state.trim(), 'i') };
        collegeQuery.state = { $regex: new RegExp(state.trim(), 'i') };
      }

      // Parallel search across collections with lean projection
      let [matchedUnis, matchedColleges] = await Promise.all([
        University.find(uniQuery)
          .select('name slug city state country logo website verified studentCount')
          .sort({ name: 1 })
          .limit(60)
          .lean(),
        College.find(collegeQuery)
          .select('aisheCode name rawName state district city website universityName collegeType')
          .sort({ name: 1 })
          .limit(100)
          .lean()
      ]);

      const formattedUnis = (matchedUnis || []).map(u => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        type: 'University',
        universityName: u.name,
        city: u.city || '',
        state: u.state || '',
        country: u.country || 'India',
        website: u.website || '',
        logo: u.logo || '',
        verified: u.verified !== false
      }));

      const formattedColleges = (matchedColleges || []).map(c => ({
        id: c._id,
        _id: c._id,
        name: c.name,
        type: 'College',
        universityName: c.universityName || '',
        city: c.city || '',
        state: c.state || '',
        country: c.country || 'India',
        website: c.website || '',
        aisheCode: c.aisheCode || '',
        verified: true
      }));

      const combined = [...formattedUnis, ...formattedColleges].slice(0, maxLimit);
      return {
        success: true,
        count: combined.length,
        universities: combined
      };
    }, 3600); // 1-hour cache TTL

    res.json(cachedResults);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchUniversities
};
