import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";

import FolderIcon from "@material-ui/icons/Folder";

const remote = require("electron").remote;
const shell = require("electron").shell;
const app = remote.app;

import NavLink from "../Components/Routing/NavLink";
import TranslateButton from "../Components/TranslationHelpers/Button";
import TranslateTypography from "../Components/TranslationHelpers/Typography";

import { openSnackbar } from "../Actions/snackbar";
import { allReleases } from "../Functions/VersionChecker";
import { humanReadableDate } from "../Functions/Utils";
import Logger from "../Functions/Logger";

const styles = {
    avatar: {
        width: 55,
        height: 55
    },
    paper: {
        padding: 24
    }
};

class ApplicationInfo extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            releases: [],
            loading: false
        };
    }

    componentDidMount() {
        this.updateReleaseList();
    }

    updateReleaseList = () => {
        this.setState({ loading: true });
        allReleases()
            .then(releases => {
                const filteredReleases = releases.filter(release => {
                    if (release.tag_name === "snapshot") return false;
                    return true;
                });
                this.setState({
                    releases: filteredReleases,
                    loading: false
                });
            })
            .catch(error => {
                this.setState({ loading: false });
                Logger.error(error);
            });
    };

    copiedValue = type => callback => {
        this.props.openSnackbar(this.props.t("Copied to your clipboard"));
    };

    render() {
        const { t } = this.props;

        const releaseItems = this.state.releases.slice(0, 10).map(release => {
            const preRelease = release.prerelease ? " (Pre-Release)" : "";
            return (
                <ListItem button component="a" className="js-external-link" rel="noopener" href={release.html_url}>
                    <ListItemText
                        primary={`v${release.tag_name} ${preRelease}`}
                        secondary={`${t("Released")}: ${humanReadableDate(release.published_at)}`}
                    />
                </ListItem>
            );
        });

        const userDataPath = app.getPath("userData");

        return (
            <Grid container spacing={24} justify={"center"}>
                <Helmet>
                    <title>{`bunqDesktop - ${t("Application Information")}`}</title>
                </Helmet>

                <Grid item xs={12} sm={8}>
                    <Paper style={styles.paper}>
                        <Grid container spacing={24} justify={"center"}>
                            <Grid item xs={12} style={{ display: "flex" }}>
                                <div style={{ marginRight: 8 }}>
                                    <a
                                        className="js-external-link"
                                        rel="noopener"
                                        href="https://github.com/bunqCommunity/bunqDesktop"
                                    >
                                        <Avatar style={styles.avatar} src="./images/512x512.png" />
                                    </a>
                                </div>

                                <div style={{ flexGrow: 1, marginTop: 4 }}>
                                    <Typography variant="h5">bunqDesktop</Typography>
                                    <Typography variant="body1">
                                        {`${t("Version")}: ${process.env.CURRENT_VERSION}`}
                                    </Typography>
                                </div>

                                <div>
                                    <IconButton onClick={() => shell.openItem(app.getPath("userData"))}>
                                        <FolderIcon />
                                    </IconButton>
                                </div>
                            </Grid>

                            <Grid item xs={12}>
                                <TranslateTypography variant="body1">Application files</TranslateTypography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    inputProps={{ readOnly: true }}
                                    value={userDataPath}
                                    label={t("Application files")}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    inputProps={{ readOnly: true }}
                                    value={Logger.transports.file.file}
                                    label={t("Log file")}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TranslateButton variant="outlined" component={NavLink} to={"/"}>
                                    Back
                                </TranslateButton>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6">Releases</Typography>
                                <List>{releaseItems}</List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { BunqJSClient } = ownProps;
    return {
        openSnackbar: message => dispatch(openSnackbar(message))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translate("translations")(ApplicationInfo));
