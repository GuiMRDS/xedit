function can(user, feature, resource) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, insecureValues) {
  if (feature === "read:user") {
    return {
      id: insecureValues.id,
      username: insecureValues.username,
      features: insecureValues.features,
      created_at: insecureValues.created_at,
      update_at: insecureValues.update_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === insecureValues.id) {
      return {
        id: insecureValues.id,
        username: insecureValues.username,
        email: insecureValues.email,
        features: insecureValues.features,
        created_at: insecureValues.created_at,
        update_at: insecureValues.update_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === insecureValues.user_id) {
      return {
        id: insecureValues.id,
        token: insecureValues.token,
        user_id: insecureValues.user_id,
        username: insecureValues.username,
        expires_at: insecureValues.expires_at,
        created_at: insecureValues.created_at,
        updated_at: insecureValues.updated_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: insecureValues.id,
      user_id: insecureValues.user_id,
      created_at: insecureValues.created_at,
      update_at: insecureValues.update_at,
      expires_at: insecureValues.expires_at,
      used_at: insecureValues.used_at,
    };
  }

  if (feature === "read:migration") {
    return insecureValues.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    const output = {
      updated_at: insecureValues.updated_at,
      dependencies: {
        database: {
          max_connections: insecureValues.dependencies.database.max_connections,
          open_connections:
            insecureValues.dependencies.database.open_connections,
        },
      },
    };

    if (user.features.includes("read:version")) {
      output.dependencies.database.version =
        insecureValues.dependencies.database.version;
    }

    return output;
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
