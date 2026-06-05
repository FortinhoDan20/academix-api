const userCreatedEmail = ({
  schoolName,
  userName,
  username,
  password,
  role,
}) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      background: #f4f7fb;
      padding: 40px;
    ">

      <div style="
        max-width: 600px;
        margin: auto;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(0,0,0,0.08);
      ">

        <!-- HEADER -->
        <div style="
          background: linear-gradient(90deg,#0f172a,#0369a1);
          padding: 30px;
          text-align: center;
          color: white;
        ">

          <img
            src="https://via.placeholder.com/100"
            alt="Logo école"
            style="
              width: 90px;
              height: 90px;
              border-radius: 50%;
              object-fit: cover;
              background: white;
              padding: 5px;
            "
          />

          <h1 style="margin-top:15px;">
            ${schoolName}
          </h1>

          <p style="opacity:0.9;">
            ERP Gestion Scolaire
          </p>
        </div>

        <!-- BODY -->
        <div style="padding: 35px;">

          <h2 style="color:#0f172a;">
            Bonjour ${userName},
          </h2>

          <p style="
            color:#475569;
            line-height:1.7;
            margin-top:15px;
          ">
            Votre compte utilisateur a été créé avec succès.
          </p>

          <div style="
            margin-top:25px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:12px;
            padding:20px;
          ">

            <p>
              <strong>Nom d'utilisateur :</strong>
              ${username}
            </p>

            <p>
              <strong>Mot de passe :</strong>
              ${password}
            </p>

            <p>
              <strong>Rôle :</strong>
              ${role}
            </p>

          </div>

          <p style="
            margin-top:25px;
            color:#dc2626;
            font-weight:bold;
          ">
            Important :
            Veuillez changer votre mot de passe après connexion.
          </p>

          <div style="margin-top:35px;text-align:center;">

            <a
              href="http://localhost:5173/login"
              style="
                display:inline-block;
                background:#0284c7;
                color:white;
                padding:14px 28px;
                border-radius:10px;
                text-decoration:none;
                font-weight:bold;
              "
            >
              Se connecter
            </a>

          </div>

        </div>

        <!-- FOOTER -->
        <div style="
          background:#f1f5f9;
          padding:20px;
          text-align:center;
          color:#64748b;
          font-size:13px;
        ">
          © 2026 ERP School - Tous droits réservés
        </div>

      </div>
    </div>
  `;
};

module.exports = userCreatedEmail;