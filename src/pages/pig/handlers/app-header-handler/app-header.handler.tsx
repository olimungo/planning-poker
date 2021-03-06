import { useState, useEffect, useContext } from 'react';
import { AppHeader, AppTheme } from '../../../../components';
import { AppContext } from '../../../common';
import { savePig } from '../../../services';

type Props = { hideBadge?: boolean };

export function AppHeaderHandler(props: Props) {
    const { hideBadge } = props;
    const appContext = useContext(AppContext);
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [name, setName] = useState<string | undefined>(undefined);
    const [vote, setVote] = useState<string | undefined>(undefined);
    const [pigChanges, setPigChanges] = useState<{ name: string, email: string }>({ name: '', email: '' });

    // When context for the pigs changes
    useEffect(() => {
        const key = appContext.pigKey || '';

        if (appContext.pigs && appContext.pigs[key]) {
            setName(appContext.pigs[key].name);
            setEmail(appContext.pigs[key].email);
            setVote(appContext.pigs[key].vote);
        }
    }, [appContext.pigKey, appContext.pigs]);

    // Save the name and email to the database
    useEffect(() => {
        const boardKey = appContext.boardKey || '';
        const pigKey = appContext.pigKey || '';
        savePig(boardKey, pigKey, pigChanges.name, pigChanges.email)
    }, [appContext.boardKey, appContext.pigKey, pigChanges]);

    const handleChange = (value: { name: string, email: string }) => setPigChanges({ name: value.name, email: value.email });

    return (
        <AppHeader name={name} email={email} vote={vote} theme={AppTheme.SECONDARY} hideBadge={hideBadge} onChange={handleChange} />
    );
};