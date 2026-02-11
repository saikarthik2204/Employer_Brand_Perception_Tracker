import React, { useState, useEffect } from 'react';
import { Company } from '../api/client';
import { fetchCompanies } from '../api/client';
import './CompanySelector.css';

interface CompanySelectorProps {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompany,
  onCompanyChange
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetchCompanies();
        setCompanies(response.companies);
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []);

  if (isLoading) {
    return <div className="company-selector loading">Loading companies...</div>;
  }

  if (error) {
    return <div className="company-selector error">{error}</div>;
  }

  const currentCompany = companies.find(c => c.id === selectedCompany);

  return (
    <div className="company-selector">
      <label htmlFor="company-select" className="selector-label">
        Select Company:
      </label>
      <div className="selector-wrapper">
        <img
          src={currentCompany?.logo}
          alt={currentCompany?.name}
          className="current-logo"
        />
        <select
          id="company-select"
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="company-dropdown"
        >
          {companies.map((company) => (
            <option
              key={company.id}
              value={company.id}
              disabled={!company.available}
            >
              {company.name}
              {!company.available ? ' (No data)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CompanySelector;
