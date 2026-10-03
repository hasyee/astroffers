import { useCallback, useEffect, useState } from 'react';
import { Alert, Intent, Tag } from '@blueprintjs/core';
import { useCurrentVersion, useFetchLatestVersion } from './version.hooks';
import { VERSION_CHECK_INTERVAL } from './version.utils';

export default function VersionListener() {
  const version = useCurrentVersion();
  const fetchLatestVersion = useFetchLatestVersion();
  const [nextVersion, setNextVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!version) return;
    const interval = setInterval(async () => {
      const latestVersion = await fetchLatestVersion();
      if (latestVersion && latestVersion !== version) setNextVersion(latestVersion);
    }, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [version, fetchLatestVersion]);

  const handleConfirm = useCallback(() => window.location.reload(), []);

  const handleClose = useCallback(() => setNextVersion(null), []);

  return (
    <Alert
      confirmButtonText="Reload now"
      cancelButtonText="Not now"
      intent={Intent.WARNING}
      isOpen={!!nextVersion}
      onCancel={handleClose}
      onConfirm={handleConfirm}
      icon="warning-sign"
    >
      <p>There is a new version of the app.</p>
      <p>
        Your version: <Tag>{version}</Tag>
      </p>
      <p>
        New version: <Tag intent={Intent.PRIMARY}>{nextVersion}</Tag>
      </p>
      <p>Would you like to reload the page?</p>
    </Alert>
  );
}
