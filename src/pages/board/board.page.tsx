import './board.page.css';
import { useParams, useHistory } from 'react-router-dom';
import {
    AppHeader,
    QrCode,
    EWorkflowState,
    ErrorMessage,
    WorkflowState,
    WorkflowBlock,
    getWorkflowStateFromString,
    AppTheme,
} from '../../components';
import { useCallback, useEffect, useState } from 'react';
import { PigsListHandler, WorkflowHandler } from './handlers';
import { AppContext, OverviewHandler, PigType, AppFooterHandler, ResultsHandler, WorkflowType, workflowTypeInit } from '../common';
import { createBoardKey, checkBoardExists, getWorkflowRef, getPigsRef, lockBoard, getLock } from '../services';

export function BoardPage() {
    const { key } = useParams<{ key: string }>();
    const history = useHistory();
    const [state, setState] = useState(EWorkflowState.UNKNOWN);
    const [errorMessage, setErrorMessage] = useState('');
    const [showVote, setShowVote] = useState(false);
    const [pigs, setPigs] = useState<PigType>({});
    const [workflow, setWorkflow] = useState<WorkflowType>(workflowTypeInit);

    const initApp = useCallback(() => {
        const lock = getLock(key) || '';

        lockBoard(key, lock).then(() => {
            setInterval(() => {
                lockBoard(key, lock);
            }, 10000);

            // Watch the database for the workflow
            const workflowRef = getWorkflowRef(key);

            workflowRef.on('value', (value) => {
                setState(getWorkflowStateFromString(value.child('state').val()));
                setWorkflow(value.val());
            });

            // Watch the database for the current pig
            const pigsRef = getPigsRef(key);

            pigsRef.on('value', (value) => {
                if (value.val()) {
                    setPigs(value.val());
                } else {
                    setPigs({});
                }
            });

            return () => {
                workflowRef.off();
                pigsRef.off();
            }

        }, () => {
            setErrorMessage('Another instance of the board is running. Wait 15 seconds and retry.');
        });
    }, [key]);

    // Initialise board
    useEffect(() => {
        if (!key) {
            const boardKey = createBoardKey();

            if (boardKey) {
                history.push(`/board/${boardKey}`);
            } else {
                setErrorMessage('A mystic error occured while creating a board');
            }
        } else {
            checkBoardExists(key).then(boardExists => {
                if (!boardExists) {
                    setErrorMessage('The board referenced in the URL doesn\'t exist.');
                } else {
                    initApp();
                }
            });
        }
    }, [key, history, initApp]);

    const handleAllPigsHaveVoted = (value: boolean) => setShowVote(value);

    return (
        <div className="board">
            <AppContext.Provider value={{ pigs, workflow, boardKey: key, theme: AppTheme.PRIMARY }}>
                <div className="board--margin-top"><AppHeader hideBadge={true} /></div>

                <div className="board--margin-top"><OverviewHandler /></div>

                <WorkflowState />

                <WorkflowHandler onAllPigsHaveVoted={handleAllPigsHaveVoted} />

                <WorkflowBlock state={state} displayState={EWorkflowState.REGISTRATION}>
                    <QrCode value={`${window.location.origin}/pig/${key}`} />
                </WorkflowBlock>

                <WorkflowBlock state={state} displayState={[
                    EWorkflowState.REGISTRATION, EWorkflowState.DISCUSSION, EWorkflowState.PAUSE,
                    EWorkflowState.VOTE, EWorkflowState.FINAL_ESTIMATE]}>
                    <PigsListHandler showVote={showVote} isClickable={false} />
                </WorkflowBlock>

                <WorkflowBlock state={state} displayState={EWorkflowState.FINAL_RESULTS}>
                    <ResultsHandler />
                </WorkflowBlock>

                <AppFooterHandler hideToggle={true} />

                <ErrorMessage message={errorMessage} />

                <div className="board--spacer"></div>
            </AppContext.Provider>
        </div>
    );
}
