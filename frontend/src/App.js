import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Using a mock Axios for now to avoid installation issues.
// I will try to install axios later.
const axios = {
  get: (url) => {
    console.log(`axios.get called with: ${url}`);
    if (url.includes('/api/scans/')) {
        const mockScan = {
            id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
            scanDate: new Date().toISOString(),
            repositoryUrl: 'https://bitbucket.org/example/repo',
            status: 'COMPLETED',
            vulnerabilities: [
                { id: 1, fileName: 'pom.xml', lineNumber: 50, description: 'Outdated dependency: commons-collections', severity: 'High', suggestedFix: 'Upgrade to version 4.4' },
                { id: 2, fileName: 'User.java', lineNumber: 25, description: 'SQL Injection', severity: 'Critical', suggestedFix: 'Use prepared statements' }
            ]
        };
        return Promise.resolve({ data: mockScan });
    }
    const mockScans = [
      { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', scanDate: new Date().toISOString(), repositoryUrl: 'https://bitbucket.org/example/repo', status: 'COMPLETED', vulnerabilities: [] },
      { id: 'd290f1ee-6c54-4b01-90e6-d701748f0852', scanDate: new Date().toISOString(), repositoryUrl: 'https://bitbucket.org/example/another-repo', status: 'IN_PROGRESS', vulnerabilities: [] },
    ];
    return Promise.resolve({ data: mockScans });
  },
  post: (url, data) => {
    console.log(`axios.post called with: ${url}`, data);
    const newScan = {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0853',
        scanDate: new Date().toISOString(),
        repositoryUrl: data.repositoryUrl,
        status: 'PENDING',
        vulnerabilities: []
    };
    return Promise.resolve({ data: newScan });
  }
};


// API functions
const API_URL = '/api/scans';

const getScans = () => axios.get(API_URL);
const getScanById = (id) => axios.get(`${API_URL}/${id}`);
const startScan = (repositoryUrl) => axios.post(API_URL, { repositoryUrl });


// Components

const ScanForm = ({ onScanStarted }) => {
    const [repoUrl, setRepoUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!repoUrl.trim()) return;
        try {
            const response = await startScan(repoUrl);
            onScanStarted(response.data);
            setRepoUrl('');
        } catch (error) {
            console.error('Error starting scan:', error);
            alert('Failed to start scan. See console for details.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="scan-form">
            <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter Bitbucket repository URL"
            />
            <button type="submit">Scan</button>
        </form>
    );
};

const ScanList = ({ scans, onSelectScan, selectedScanId }) => (
    <ul className="scan-list">
        {scans.map(scan => (
            <li
                key={scan.id}
                onClick={() => onSelectScan(scan.id)}
                className={selectedScanId === scan.id ? 'selected' : ''}
            >
                <div><strong>Repo:</strong> {scan.repositoryUrl}</div>
                <div><strong>Date:</strong> {new Date(scan.scanDate).toLocaleString()}</div>
                <div><strong>Status:</strong> <span className={`status status-${scan.status}`}>{scan.status}</span></div>
            </li>
        ))}
    </ul>
);

const VulnerabilityTable = ({ vulnerabilities }) => (
    <table className="vulnerability-table">
        <thead>
            <tr>
                <th>File</th>
                <th>Line</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Fix</th>
            </tr>
        </thead>
        <tbody>
            {vulnerabilities.map((vuln, index) => (
                <tr key={index}>
                    <td>{vuln.fileName}</td>
                    <td>{vuln.lineNumber || 'N/A'}</td>
                    <td>{vuln.description}</td>
                    <td>{vuln.severity}</td>
                    <td>{vuln.suggestedFix}</td>
                </tr>
            ))}
        </tbody>
    </table>
);


const ScanDetails = ({ scan }) => {
    if (!scan) {
        return <div className="scan-details">Select a scan to see details.</div>;
    }

    return (
        <div className="scan-details">
            <h2>Scan Details</h2>
            <p><strong>ID:</strong> {scan.id}</p>
            <p><strong>Repo URL:</strong> {scan.repositoryUrl}</p>
            <p><strong>Scan Date:</strong> {new Date(scan.scanDate).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`status status-${scan.status}`}>{scan.status}</span></p>
            <h3>Vulnerabilities ({scan.vulnerabilities.length})</h3>
            {scan.vulnerabilities.length > 0 ? (
                <VulnerabilityTable vulnerabilities={scan.vulnerabilities} />
            ) : (
                <p>No vulnerabilities found.</p>
            )}
        </div>
    );
};


function App() {
    const [scans, setScans] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchScans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getScans();
            setScans(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch scans.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScans();
        const interval = setInterval(fetchScans, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchScans]);

    const handleSelectScan = useCallback(async (id) => {
        try {
            const response = await getScanById(id);
            setSelectedScan(response.data);
        } catch (err) {
            console.error('Error fetching scan details:', err);
            setError('Failed to fetch scan details.');
        }
    }, []);

    const handleScanStarted = (newScan) => {
        setScans(prevScans => [newScan, ...prevScans]);
        handleSelectScan(newScan.id);
    };

    if (loading && scans.length === 0) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="App">
            <h1>Vulnerability Scanner</h1>
            <ScanForm onScanStarted={handleScanStarted} />
            <div className="scan-list-container">
                <div style={{ flex: 1 }}>
                    <h2>Recent Scans</h2>
                    <ScanList scans={scans} onSelectScan={handleSelectScan} selectedScanId={selectedScan?.id} />
                </div>
                <div style={{ flex: 2 }}>
                    <ScanDetails scan={selectedScan} />
                </div>
            </div>
        </div>
    );
}

export default App;
