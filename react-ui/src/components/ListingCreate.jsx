import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { createListing } from "../database/listing";
import { getHost } from "../database/settings";
import { sendListingToContacts, getMiniAddress } from '../minima';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextareaAutosize from '@mui/base/TextareaAutosize';



export default function ListingCreate() {
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    name: "",
    asking_price: "",
    image:"",
    description:""
  });
  const [walletAddress, setWalletAddress] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getHost().then((host) => {
      setHost(host);
    });
  },[]);

  useEffect(() => {
    async function getWalletAddress() {
      setWalletAddress(await getMiniAddress().catch((e)=>console.error(`Get Mini address failed: ${e}`)));
    }
    getWalletAddress().catch((e)=>console.error(`Get wallet address failed: ${e}`));
  }, []);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // When a post request is sent to the create url, we'll add a new record to the database.
    const newListing = { ...form };

    createListing({
      name: newListing.name,
      price: newListing.asking_price,
      createdByPk: host.pk,
      createdByName: host.name,
      walletAddress: walletAddress,
      image:newListing.image,
      description:newListing.description
    })
    .then(function(listingId) {
        console.log(`Listing successfully added: ${listingId}`);
        console.log(`Attempting to send listing to contacts...`);
        return sendListingToContacts(listingId);
      }).then((result) => {
        if (result.message){
          setError(`Could not send listing to contacts`);
          console.error(result.message);
          setLoading(false);
        } else {
          console.log('Successfully sent listing to contacts');
          setLoading(false);
          setForm({ name: "", asking_price: "" });
          setSuccess(true);
        }
      }).catch((e) => {
        console.log(e);
        setError(`There was an error creating or sending your listing`);
        console.error(`Could not create or send listing ${e}`);
        setLoading(false);
      });
  }

  const handleGoHome = () => {
    navigate(-1);
  }
  const fileToDataUri = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    })
  const handleUpload=async (e)=>{
    if (e.target.files) {
      const file = await fileToDataUri(e.target.files[0]) 
      updateForm({image:file});
      console.log("image added");
    }
  }


  if (walletAddress && host) {
    // This following section will display the form that takes the input from the user.
    return (
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Create New Listing
        </Typography>
        <Box
          component="form"
          sx={{ mt: 3 }}
          noValidate
          autoComplete="off"
          onSubmit={onSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Listing Title"
                id="listing-name"
                className="form-field"
                type="text"
                required
                fullWidth
                name="title"
                value={form.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth>
                {form.image ?   
                 <Box
                  component="img"
                  sx={{
                    height: 150,
                    width: 250,
                    maxHeight: { xs: 150, md: 167 },
                    maxWidth: { xs: 250, md: 250 },
                  }}
                  alt="The house from the offer."
                  src={form.image}
                /> : ""}
                <InputLabel htmlFor="image" focused={true} shrink={true}>Image*</InputLabel>
                <OutlinedInput
                  id="image"
                  type="file"
                  label="Image"
                  onChange={(e)=>{handleUpload(e)}}
                  accept="image/png, image/gif, image/jpeg"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="asking-price">Asking Price *</InputLabel>
                <OutlinedInput
                  id="asking-price"
                  value={form.asking_price}
                  required="true"
                  onChange={(e) => updateForm({ asking_price: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">MIN</InputAdornment>
                  }
                  label="Asking Price"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextareaAutosize
                  id="description"
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Description"
                  minRows={5}
                  maxRows={10}
                  size="md"
                />
              </FormControl>
            </Grid>
          </Grid>
          <LoadingButton
            fullWidth
            variant="contained"
            type="submit"
            value="Create Token"
            loading={loading}
            loadingPosition="end"
            sx={{ mt: 3, mb: 2 }}
          >
            Publish
          </LoadingButton>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert action={
            <Button color="inherit" size="small" onClick={handleGoHome}>
              OK
            </Button>
          } severity="success">Listing created and shared!</Alert> : null}
        </Box>
      </Box>
    );
  }
  else {
    return (
      <Stack mt={4} spacing={1}>
        {/* For variant="text", adjust the height via font-size */}
        <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
        {/* For other variants, adjust the size with `width` and `height` */}
        <Skeleton variant="rounded" width='100%' height={60} />
        <Skeleton variant="rounded" width='100%' height={60} />
        <Skeleton variant="rounded" width='100%' height={60} />
      </Stack>
    );
  }
}
