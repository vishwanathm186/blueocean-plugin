/**
 * Created by cmeyers on 8/12/16.
 */
import fetch from 'isomorphic-fetch';
import * as sse from '@jenkins-cd/sse-gateway';

import { SseBus } from '../model/SseBus';
import { checkMatchingFavoriteUrls } from '../util/FavoriteUtils';

class FavoritesSseListener {

    initialize(store, jobListener) {
        if (this.store && this.sseBus) {
            return;
        }

        this.store = store;
        this.sseBus = new SseBus(sse, fetch);
        this.sseBus.subscribeToJob(
            jobListener,
            (event) => this._filterJobs(event)
        );
    }

    _filterJobs(event) {
        const favorites = this.store.getState().favoritesStore.get('favorites');

        // suppress processing of any events whose job URL doesn't match the favorited item's URL
        if (favorites && favorites.size > 0) {
            for (const favorite of favorites) {
                const favoriteUrl = favorite.item._links.self.href;
                const pipelineOrBranchUrl = event.blueocean_job_rest_url;

                if (checkMatchingFavoriteUrls(favoriteUrl, pipelineOrBranchUrl)) {
                    return true;
                }
            }
        }

        return false;
    }

}

export default new FavoritesSseListener();
