/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var utils = require('ripple/utils'),
    db = require('ripple/db'),
    app = require('ripple/app'),
    constants = require('ripple/constants');

function _objectFactory(context, objects, allowed) {
    utils.forEach(objects, function (obj, key) {
        var result = {};

        if (allowed(obj)) {
            result = obj.path ? require('ripple/platform/' + obj.path) : {};
        }

        if (obj.children) {
            _objectFactory(result, obj.children, allowed);
        }

        // inject into the context if it is allowed or it has children that were allowed
        if (allowed(obj) || utils.count(result)) {
            context[key] = result;
        }
    });
}

module.exports = {
    build: function (objects) {
        return {
            into: function (sandbox) {
                var features = utils.copy(app.getInfo().features),
                    allowed = function (obj) {
                        var contains = function (requirements) {
                            return requirements.split('|').some(function (feature) {
                                return !!features[feature];
                            });
                        };
                        //object is allowed if:
                        // 1. it has no feature requirement
                        // 2. the config file doesn't exist (features collection is null)
                        // 3. the feature exists in the defined features
                        return !obj.feature || !features || (features && contains(obj.feature));
                    };

                _objectFactory(sandbox, objects, allowed);
            }
        };
    }
};
