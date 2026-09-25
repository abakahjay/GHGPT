import { useEffect, useState } from 'react';
import { fetchImage } from './fetchImage';

// Loads an image stored on the backend by id and returns an object URL
// ('' until it has loaded, or when there is no id).
export const ProfileUrl = (Id) => {
    const [url, setUrl] = useState('');
    useEffect(() => {
        if (!Id) {
            setUrl('');
            return;
        }
        let objectUrl;
        let cancelled = false;
        fetchImage(Id)
            .then((imageURL) => {
                objectUrl = imageURL;
                if (!cancelled) setUrl(imageURL);
            })
            .catch((err) => console.error(err));
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [Id]);

    return url;
};

// Avatar source for a user: an uploaded picture wins, then the Google photo URL.
export const useProfilePic = (user) => {
    const uploaded = ProfileUrl(user?.profile_picture_id);
    return uploaded || user?.profile_picture || '';
};
