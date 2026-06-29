import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LEVEL_LABELS = {
    province: 'Province',
    ville: 'Ville',
    territoire: 'Territoire',
    commune: 'Commune',
    secteur: 'Secteur',
    quartier: 'Quartier',
};

const LEVEL_CHAIN = {
    province: ['ville', 'territoire'],
    ville: ['commune'],
    territoire: ['secteur'],
    commune: ['quartier'],
    secteur: [],
    quartier: [],
};

export default function DivisionPicker({ provinces = [], value, onChange, error }) {
    const [selections, setSelections] = useState([]);
    const [options, setOptions] = useState({ 0: provinces });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!value) return;

        axios.get(`/api/divisions/${value}/path`)
            .then(({ data }) => {
                const path = data.path || [];
                const newSelections = path.map((d) => d.id);
                setSelections(newSelections);
                loadOptionsForPath(path);
            })
            .catch(() => {});
    }, []);

    const loadOptionsForPath = async (path) => {
        const newOptions = { 0: provinces };

        for (let i = 0; i < path.length; i++) {
            const division = path[i];
            const nextLevels = LEVEL_CHAIN[division.level] || [];

            if (nextLevels.length > 0 && path[i + 1]) {
                const parentId = division.id;
                const { data } = await axios.get('/api/divisions', { params: { parent_id: parentId } });
                newOptions[i + 1] = data;
            }
        }

        setOptions(newOptions);
    };

    const fetchChildren = async (parentId, index) => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/divisions', { params: { parent_id: parentId } });
            setOptions((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (Number(k) > index) delete next[k];
                });
                if (data.length > 0) {
                    next[index + 1] = data;
                }
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (index, divisionId) => {
        const division = options[index]?.find((d) => d.id === Number(divisionId));
        if (!division) return;

        const newSelections = selections.slice(0, index);
        newSelections[index] = division.id;
        setSelections(newSelections);

        onChange(division.id);

        const nextLevels = LEVEL_CHAIN[division.level] || [];
        if (nextLevels.length > 0) {
            fetchChildren(division.id, index);
        } else {
            setOptions((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (Number(k) > index) delete next[k];
                });
                return next;
            });
        }
    };

    const indices = Object.keys(options).map(Number).sort((a, b) => a - b);

    return (
        <div className="space-y-3">
            {indices.map((index) => {
                const opts = options[index] || [];
                const level = opts[0]?.level;
                const label = level ? LEVEL_LABELS[level] || level : (index === 0 ? 'Province' : 'Division');

                return (
                    <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label} {index === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={selections[index] || ''}
                            onChange={(e) => handleSelect(index, e.target.value)}
                            disabled={loading}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="">— Sélectionner —</option>
                            {opts.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                );
            })}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <p className="text-xs text-gray-500">
                Sélectionnez la localisation la plus précise possible (commune ou territoire).
            </p>
        </div>
    );
}
